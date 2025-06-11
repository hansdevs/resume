document.addEventListener("DOMContentLoaded", () => {
  const jobListingsContainer = document.getElementById("job-listings")
  const searchInput = document.getElementById("search-input")
  const categoryFilter = document.getElementById("category-filter")
  const applyFiltersBtn = document.getElementById("apply-filters-btn")
  const currentYearSpan = document.getElementById("current-year")

  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear()
  }

  const allJobs = [
    {
      id: "job1",
      title: "Senior UI/UX Designer",
      companyName: "Innovatech Solutions",
      companyLogo: "images/company.jpg",
      location: "Remote (Global)",
      type: "Full-time",
      category: "UI/UX Design",
      description:
        "Seeking a creative Senior UI/UX Designer to lead design projects for web and mobile applications. Strong portfolio required.",
      postedDate: "2025-06-10",
      tags: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      salaryRange: "$90k - $120k",
    },
    {
      id: "job2",
      title: "Freelance Video Editor for YouTube Channel",
      companyName: "Creator Collective",
      companyLogo: "images/company.jpg",
      location: "Remote (US Only)",
      type: "Contract",
      category: "Video Editing",
      description:
        "We need a skilled video editor for engaging YouTube content. Experience with Adobe Premiere Pro and After Effects is a must.",
      postedDate: "2025-06-08",
      tags: ["Premiere Pro", "After Effects", "Storytelling", "Color Grading"],
      salaryRange: "$40 - $60/hr",
    },
    {
      id: "job3",
      title: "React Native Developer",
      companyName: "MobileFirst Apps",
      companyLogo: "images/company.jpg",
      location: "Remote",
      type: "Full-time",
      category: "Mobile Development",
      description:
        "Join our team to build cross-platform mobile apps using React Native. Experience with Redux and native modules is a plus.",
      postedDate: "2025-06-05",
      tags: ["React Native", "JavaScript", "Redux", "API Integration"],
      salaryRange: "$100k - $130k",
    },
    {
      id: "job4",
      title: "Graphic Designer for Social Media",
      companyName: "SocialSpark Agency",
      companyLogo: "images/company.jpg",
      location: "Remote",
      type: "Part-time",
      category: "Graphics Design",
      description:
        "Create eye-catching graphics for various social media platforms. Proficiency in Adobe Creative Suite (Photoshop, Illustrator).",
      postedDate: "2025-06-02",
      tags: ["Photoshop", "Illustrator", "Branding", "Social Media Marketing"],
      salaryRange: "$25 - $35/hr",
    },
    {
      id: "job5",
      title: "Full-Stack Web Developer (Node.js & Vue.js)",
      companyName: "WebWeavers Inc.",
      companyLogo: "images/company.jpg",
      location: "Remote (EU Timezones)",
      type: "Full-time",
      category: "Web Development",
      description:
        "Develop and maintain web applications using Node.js for the backend and Vue.js for the frontend. Experience with MongoDB.",
      postedDate: "2025-05-28",
      tags: ["Node.js", "Vue.js", "MongoDB", "REST APIs", "Git"],
      salaryRange: "€70k - €90k",
    },
    {
      id: "job6",
      title: "Technical Content Writer - SaaS",
      companyName: "CloudBoost",
      companyLogo: "images/company.jpg",
      location: "Remote",
      type: "Contract",
      category: "Content Writing",
      description:
        "Write clear and concise technical articles, blog posts, and documentation for our SaaS product. Understanding of cloud technologies.",
      postedDate: "2025-05-25",
      tags: ["Technical Writing", "SaaS", "Blogging", "SEO", "Cloud Computing"],
      salaryRange: "$50 - $70/hr",
    },
    {
      id: "job7",
      title: "Motion Graphics Artist",
      companyName: "Pixel Perfect Studios",
      companyLogo: "images/company.jpg",
      location: "Remote",
      type: "Project-based",
      category: "Graphics Design",
      description:
        "Create compelling motion graphics for promotional videos and digital campaigns. Expertise in After Effects and Cinema 4D preferred.",
      postedDate: "2025-06-11",
      tags: ["After Effects", "Cinema 4D", "Animation", "Visual Effects"],
      salaryRange: "Project-based ($500 - $2000 per project)",
    },
    {
      id: "job8",
      title: "WordPress Developer for E-commerce Site",
      companyName: "Shopify Masters",
      companyLogo: "images/company.jpg",
      location: "Remote",
      type: "Contract",
      category: "Web Development",
      description:
        "Customize and maintain WordPress/WooCommerce e-commerce websites. Strong PHP, HTML, CSS, and JavaScript skills needed.",
      postedDate: "2025-06-09",
      tags: ["WordPress", "WooCommerce", "PHP", "E-commerce", "Plugin Development"],
      salaryRange: "$45 - $65/hr",
    },
  ]

  const locationIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg>`
  const typeIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"></path></svg>`
  const categoryIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.86L12 5.84zM21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H3c-1.1 0-2 .9-2 2v8c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.22-1.05-.59-1.42zM13 20.01L4 11V4h7v-.01l7.41 7.41-5.41 5.6z"></path></svg>`
  const salaryIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path></svg>`

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text
    }
    return text.substr(0, text.lastIndexOf(" ", maxLength)) + "..."
  }

  function displayJobs(jobsToDisplay) {
    jobListingsContainer.innerHTML = ""

    if (jobsToDisplay.length === 0) {
      jobListingsContainer.innerHTML = '<p class="no-results-message">No jobs found matching your criteria.</p>'
      return
    }

    jobsToDisplay.forEach((job) => {
      const jobCard = document.createElement("div")
      jobCard.classList.add("job-card")
      const categoryClass = "category-" + job.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      jobCard.innerHTML = `
                <div class="job-card-header">
                    <img src="${job.companyLogo}" alt="${job.companyName} Logo" class="company-logo">
                    <div class="job-title-company">
                        <h3 class="job-title">${job.title}</h3>
                        <p class="company-name">${job.companyName}</p>
                    </div>
                </div>
                <div class="job-details">
                    <span>${locationIcon}${job.location}</span>
                    <span class="job-type type-${job.type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${typeIcon}${job.type}</span>
                    <span class="tag category-tag ${categoryClass}">${categoryIcon}${job.category}</span>
                    ${job.salaryRange ? `<span>${salaryIcon}${job.salaryRange}</span>` : ""}
                </div>
                <p class="job-description">${truncateText(job.description, 120)}</p>
                <div class="job-tags">
                    ${job.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
                </div>
                <div class="job-card-footer">
                    <span class="posted-date">Posted: ${formatDate(job.postedDate)}</span>
                    <a href="#" class="apply-button" aria-label="Apply for ${job.title}">Apply Now</a>
                </div>
            `
      jobListingsContainer.appendChild(jobCard)
    })
  }

  function filterJobs() {
    const searchTerm = searchInput.value.toLowerCase()
    const selectedCategory = categoryFilter.value
    const filteredJobs = allJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm) ||
        job.companyName.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      const matchesCategory = selectedCategory ? job.category === selectedCategory : true
      return matchesSearch && matchesCategory
    })
    displayJobs(filteredJobs)
  }

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", filterJobs)
  }
  if (searchInput) {
    searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        filterJobs()
      }
    })
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterJobs)
  }

  displayJobs(allJobs)
})
