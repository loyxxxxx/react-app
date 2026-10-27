using System;
using System.ComponentModel.DataAnnotations;

namespace AuthBackend.Models
{
    public class User
    {
        [Key]
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateTime DateCreated { get; set; }
    }
}