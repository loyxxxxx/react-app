using AuthBackend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;

namespace AuthBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly MasterDbContext _masterContext;

        public AuthController(MasterDbContext masterContext)
        {
            _masterContext = masterContext;
        }

        public class VerifyAgencyRequest { public string AgencyId { get; set; } = string.Empty; }
        public class LoginRequest
        {
            public string AgencyId { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        // STEP 1: Verify Agency ID exists
        [HttpPost("verify-agency")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> VerifyAgency([FromBody] VerifyAgencyRequest request)
        {
            var agency = await _masterContext.Agencies.FirstOrDefaultAsync(a => a.AgencyId == request.AgencyId);
            if (agency == null) return NotFound("Agency ID not found.");

            return Ok(new { message = "Agency verified." });
        }

        // STEP 2: Login to specific Agency Database
        [HttpPost("login")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Get connection string from Master DB
            var agency = await _masterContext.Agencies.FirstOrDefaultAsync(a => a.AgencyId == request.AgencyId);
            if (agency == null) return Unauthorized("Invalid Agency.");

            // 2. Dynamically connect to the Tenant DB (react or react2)
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlServer(agency.ConnString);
            using var tenantContext = new AppDbContext(optionsBuilder.Options);

            // 3. Verify user in the Tenant DB
            var user = await tenantContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);
            if (user == null) return Unauthorized("Invalid email or password.");

            // 4. Issue Secure Cookie WITH Agency Context
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email),
                new Claim("AgencyId", agency.AgencyId) // Storing the Agency Context!
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));

            return Ok(new { message = "Logged in successfully" });
        }

        [HttpPost("logout")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("session-check")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult CheckSession()
        {
            var agencyId = User.FindFirst("AgencyId")?.Value;
            return Ok(new { email = User.Identity?.Name, agencyId = agencyId });
        }

        [HttpGet("csrf-token")]
        public IActionResult GetCsrfToken([FromServices] IAntiforgery antiforgery)
        {
            var tokens = antiforgery.GetAndStoreTokens(HttpContext);

            Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return NoContent();
        }

        // STEP 3: Multi-Tenant Session Renewal
        [HttpPost("renew-session")]
        [Microsoft.AspNetCore.Authorization.Authorize] // Require active cookie to extract claims
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> RenewSession([FromBody] RenewRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Password is required.");
            }

            // 1. Extract context from the secure cookie
            var currentEmail = User.Identity?.Name;
            var agencyId = User.FindFirst("AgencyId")?.Value;

            if (string.IsNullOrEmpty(currentEmail) || string.IsNullOrEmpty(agencyId))
            {
                return Unauthorized("Session context lost. Please log in again.");
            }

            // 2. Get connection string for this specific Tenant
            var agency = await _masterContext.Agencies.FirstOrDefaultAsync(a => a.AgencyId == agencyId);
            if (agency == null) return Unauthorized("Invalid Agency.");

            // 3. Connect to the Tenant DB
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlServer(agency.ConnString);
            using var tenantContext = new AppDbContext(optionsBuilder.Options);

            // 4. Verify password in the Tenant DB
            var user = await tenantContext.Users.FirstOrDefaultAsync(u => u.Email == currentEmail);
            if (user == null) return Unauthorized("User not found.");

            if (user.Password == request.Password)
            {
                return Ok(new { message = "Session renewed successfully." });
            }

            return Unauthorized("Incorrect password.");
        }
    }

    public class RenewRequest
    {
        public string Password { get; set; } = string.Empty;
    }
}