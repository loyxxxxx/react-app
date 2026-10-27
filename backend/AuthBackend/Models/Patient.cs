using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models
{
    [Table("patient")]
    public class Patient
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("last_name")]
        public string LastName { get; set; } = string.Empty;

        [Column("first_name")]
        public string FirstName { get; set; } = string.Empty;

        [Column("date_of_birth")]
        public DateTime DateOfBirth { get; set; }

        [Column("admission_date")]
        public DateTime AdmissionDate { get; set; }

        [Column("dateCreated")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public DateTime? DateCreated { get; set; }

        public int? is_deleted { get; set; }
    }
}