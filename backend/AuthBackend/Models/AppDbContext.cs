using Microsoft.EntityFrameworkCore;

namespace AuthBackend.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
        public DbSet<Patient> Patients { get; set; } 
        public DbSet<TenantAgency> Agencies { get; set; }
        public DbSet<Insurance> Insurances { get; set; }
        public DbSet<Oasis> Oasis { get; set; }
    }
}