using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuthBackend.Models
{
    public class Insurance
    {
        [Key]
        public int Id { get; set; }
        public string PayorName { get; set; } = string.Empty;
        public string PolicyNumber { get; set; } = string.Empty;
        public DateTime EffectiveDate { get; set; }
        public bool IsPrimary { get; set; }
        public int? is_deleted { get; set; }
    }

    public class Oasis
    {
        [Key]
        public int OasisId { get; set; }
        public int M0020_PAT_ID { get; set; }
        public int InsuranceID { get; set; }
        public string M0100_ASSMT_REASON { get; set; } = string.Empty;
        public DateTime M0030_START_CARE_DT { get; set; }
        public DateTime M0090_INFO_COMPLETED_DT { get; set; }
        public string M1021_PRIMARY_DIAG_ICD { get; set; } = string.Empty;
        public int M1400_SHRT_BREATH { get; set; }
        public int M1830_BATHING { get; set; }
        public int M1860_AMBULATION { get; set; }
        public int? is_deleted { get; set; }

        // Navigation property (Optional, but good for EF)
        [ForeignKey("InsuranceID")]
        public virtual Insurance? Insurance { get; set; }
    }
}