from jobspy import scrape_jobs

jobs = scrape_jobs(
    site_name=["indeed", "linkedin", "zip_recruiter", "google", "glassdoor"],
    search_term="frontend developer",
    google_search_term="software engineer jobs near Detroit, MI since yesterday",
    location="Detroit, MI",
    is_remote=True,
    results_wanted=20,
    hours_old=72,
    country_indeed="USA",
    # linkedin_fetch_description=True # gets more info such as description, direct job url (slower)
    # proxies=["208.195.175.46:65095", "208.195.175.45:65095", "localhost"],
)
print(f"Found {len(jobs)} jobs")
print(jobs.head())

jobs.to_json("jobs.json", orient="records")
