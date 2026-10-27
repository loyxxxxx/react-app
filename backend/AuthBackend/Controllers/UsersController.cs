using AuthBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly MasterDbContext _masterContext;

        public UsersController(MasterDbContext masterContext)
        {
            _masterContext = masterContext;
        }

        // Helper to get the correct database context based on the logged-in user's cookie
        private async Task<AppDbContext?> GetTenantContextAsync()
        {
            var agencyId = User.FindFirst("AgencyId")?.Value;
            if (string.IsNullOrEmpty(agencyId)) return null;

            var agency = await _masterContext.Agencies.FirstOrDefaultAsync(a => a.AgencyId == agencyId);
            if (agency == null) return null;

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseSqlServer(agency.ConnString);
            return new AppDbContext(optionsBuilder.Options);
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            using var tenantContext = await GetTenantContextAsync();
            if (tenantContext == null) return Unauthorized("Agency context lost.");

            var users = await tenantContext.Users.ToListAsync();
            return Ok(users);
        }

        // Note: You would apply this same GetTenantContextAsync() logic to your Create, Update, and Delete methods!
    }
}