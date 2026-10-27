using AuthBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AgencyController : ControllerBase
    {
        private readonly MasterDbContext _masterContext;

        public AgencyController(MasterDbContext masterContext)
        {
            _masterContext = masterContext;
        }

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
        public async Task<IActionResult> GetAgencyInfo()
        {
            using var tenantContext = await GetTenantContextAsync();
            if (tenantContext == null) return Unauthorized("Agency context lost.");

            // Fetch the single agency record in this tenant database
            var tenantAgency = await tenantContext.Agencies.FirstOrDefaultAsync();

            if (tenantAgency == null) return NotFound("Agency data not found in tenant database.");

            return Ok(tenantAgency);
        }
    }
}