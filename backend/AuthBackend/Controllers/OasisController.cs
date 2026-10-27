using AuthBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requires the secure cookie
    public class OasisController : ControllerBase
    {
        private readonly MasterDbContext _masterContext;

        public OasisController(MasterDbContext masterContext)
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

        // READ: Get OASIS by Patient ID
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            using var tenantContext = await GetTenantContextAsync();
            if (tenantContext == null) return Unauthorized("Invalid Tenant Context");

            var oasisRecord = await tenantContext.Oasis
                .Include(o => o.Insurance)
                .FirstOrDefaultAsync(o => o.M0020_PAT_ID == patientId && o.is_deleted == null);

            if (oasisRecord == null) return NotFound("OASIS record not found for this patient.");

            return Ok(oasisRecord);
        }

        // UPDATE: Save changes back to the Database
        [HttpPut("{oasisId}")]
        [IgnoreAntiforgeryToken] // Keep per your PoC setup
        public async Task<IActionResult> UpdateOasis(int oasisId, [FromBody] Oasis updatedData)
        {
            using var tenantContext = await GetTenantContextAsync();
            if (tenantContext == null) return Unauthorized("Invalid Tenant Context");

            var existingRecord = await tenantContext.Oasis.FindAsync(oasisId);
            if (existingRecord == null) return NotFound("OASIS record not found.");

            // Apply updates
            existingRecord.M1400_SHRT_BREATH = updatedData.M1400_SHRT_BREATH;
            existingRecord.M1830_BATHING = updatedData.M1830_BATHING;
            existingRecord.M1860_AMBULATION = updatedData.M1860_AMBULATION;

            await tenantContext.SaveChangesAsync();

            return Ok(new { message = "OASIS data updated successfully.", data = existingRecord });
        }
    }
}