using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Net;
using System.Net.Mail;
using Improv3.Services;
using Npgsql;

namespace Improv3
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddScoped<NpgsqlConnection, NpgsqlConnection>(provider => new NpgsqlConnection(Configuration.GetConnectionString("Improv3DbContextConnection")));
            services.AddScoped<DataService, DataService>();

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
            services.Configure<IdentityOptions>(options =>
            {
                // Default Lockout settings.
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                options.Lockout.MaxFailedAccessAttempts = 10;
                options.Lockout.AllowedForNewUsers = true;

                // Default Password settings.
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequiredLength = 4;
                options.Password.RequiredUniqueChars = 0;

                // Default SignIn settings.
                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;

                options.User.RequireUniqueEmail = true;
            });
            services.ConfigureApplicationCookie(options =>
            {
                options.AccessDeniedPath = "/Identity/Account/AccessDenied";
                options.Cookie.Name = "Improv3Identity";
                options.Cookie.HttpOnly = true;
                options.ExpireTimeSpan = TimeSpan.FromDays(60);
                options.LoginPath = "/Identity/Account/Login";
                // ReturnUrlParameter requires
                //using Microsoft.AspNetCore.Authentication.Cookies;
                options.ReturnUrlParameter = CookieAuthenticationDefaults.ReturnUrlParameter;
                options.SlidingExpiration = true;
            });
            services.AddTransient<IEmailSender>(provider =>
            {
                var config = provider.GetRequiredService<IConfiguration>();
                return new Services.EmailSender(
                    new SmtpClient
                    {
                        Host = config.GetValue<string>("Email:Smtp:Host"),
                        Port = config.GetValue<int>("Email:Smtp:Port"),
                        Credentials = new NetworkCredential(
                            config.GetValue<string>("Email:Smtp:Username"),
                            config.GetValue<string>("Email:Smtp:Password")
                        )
                    },
                    config.GetValue<string>("Email:From"));
            });
            services.AddAuthentication()
                .AddGoogle(options =>
                {
                    var googleAuthNSection = Configuration.GetSection("Authentication:Google");
                    options.ClientId = googleAuthNSection["ClientId"];
                    options.ClientSecret = googleAuthNSection["ClientSecret"];
                });
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");

                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseAuthentication();

            app.UseMvc();
        }
    }
}
