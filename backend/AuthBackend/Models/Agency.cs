using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models
{
    [Table("listofagencies")]
    public class Agency
    {
        [Key]
        public int Id { get; set; }
        public string AgencyId { get; set; } = string.Empty;
        [Column("db_name")]
        public string DbName { get; set; } = string.Empty;
        public string ConnString { get; set; } = string.Empty;
    }
}