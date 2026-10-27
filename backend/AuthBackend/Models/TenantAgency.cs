using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models
{
    [Table("agency")]
    public class TenantAgency
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Column("AgencyId")]
        public string AgencyId { get; set; } = string.Empty;

        [Column("Agency_Name")]
        public string AgencyName { get; set; } = string.Empty;

        [Column("is_active")]
        public bool IsActive { get; set; }

        [Column("dateCreated")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime? DateCreated { get; set; }
    }
}