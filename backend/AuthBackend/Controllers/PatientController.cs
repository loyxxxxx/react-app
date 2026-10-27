using AuthBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthBackend.Controllers
{
    [Authorize]
    [Route("api/patients")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class PatientsController : ControllerBase
    {
        private readonly MasterDbContext _masterContext;

        public PatientsController(MasterDbContext masterContext)
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
        public async Task<IActionResult> GetPatients()
        {
            using var tenantContext = await GetTenantContextAsync();
            if (tenantContext == null) return Unauthorized();

            // Only fetch patients where is_deleted is null
            var patients = await tenantContext.Patients.Where(p => p.is_deleted == null).ToListAsync();

            return Ok(patients);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePatient([FromBody] Patient patient)
        {
            using var tenantContext = await GetTenantContextAsync();
            if (tenantContext == null) return Unauthorized("Agency context lost.");

            tenantContext.Patients.Add(patient);
            await tenantContext.SaveChangesAsync();
            return Ok(patient);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(int id, [FromBody] Patient updatedPatient)
        {
            using var tenantContext = await GetTenantContextAsync();
            if (tenantContext == null) return Unauthorized("Agency context lost.");

            var patient = await tenantContext.Patients.FindAsync(id);
            if (patient == null) return NotFound("Patient not found");

            patient.FirstName = updatedPatient.FirstName;
            patient.LastName = updatedPatient.LastName;
            patient.DateOfBirth = updatedPatient.DateOfBirth;
            patient.AdmissionDate = updatedPatient.AdmissionDate;

            await tenantContext.SaveChangesAsync();
            return Ok(patient);
        }

        [HttpDelete("{id}")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> DeletePatient(int id)
        {
            using var tenantContext = await GetTenantContextAsync();
            if (tenantContext == null) return Unauthorized();

            var patient = await tenantContext.Patients.FindAsync(id);
            if (patient == null) return NotFound("Patient not found.");

            // Soft Delete: Flip the flag instead of removing the row
            patient.is_deleted = 1;
            await tenantContext.SaveChangesAsync();

            return Ok(new { message = "Patient softly deleted." });
        }
    }
}