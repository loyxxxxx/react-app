using Microsoft.EntityFrameworkCore;

namespace AuthBackend.Models
{
	public class MasterDbContext : DbContext
	{
		public MasterDbContext(DbContextOptions<MasterDbContext> options) : base(options) { }
		public DbSet<Agency> Agencies { get; set; }
	}
}