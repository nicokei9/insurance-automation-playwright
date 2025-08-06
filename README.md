# 📊 Insurance Automation with Playwright

This project automates repetitive insurance-related tasks using [Playwright](https://playwright.dev/). It simulates real-world administrative workflows, including user login, navigation through insurance portals, report generation, and Excel file downloads.

---

## 🚀 Project Overview

The automation focuses on two insurance platforms:

- **BSE (Banco de Seguros del Estado)** – Automatically downloads two types of reports for three different user accounts.
- **Porto Seguro** – Logs in with different users, navigates dynamic menus, filters debt reports by status, and extracts structured data.

The current implementation uses three user accounts per portal to simulate a real-world multi-user workflow.  
This setup can be easily adapted to support more or fewer users as needed.

This was originally a manual task performed weekly. The project aims to eliminate human error, save time, and serve as a QA Automation showcase.

---

## ✨ Features

- Automated login for multiple users
- Report generation monitoring and status polling
- Excel report download (.xls format)
- Conditional UI interactions (e.g., waiting for specific states)
- QA-grade test assertions using `expect`
- Clear and professional logging

---

## 🧰 Tech Stack

- [Playwright Test](https://playwright.dev/test) – Automation framework
- TypeScript – Language for better type safety
- Node.js – Runtime
- Dotenv – For managing environment variables securely
- VS Code – Recommended editor

---

## 📁 Folder Structure

```
insurance-automation-playwright/
├── scripts/
│   ├── bse/       # Automation for BSE reports
│   └── porto/     # Automation for Porto Seguro data extraction
├── downloads/     # Folder where .xls or .json files are saved
├── .env           # Environment variables (not included in repo)
└── README.md
```

---

## ▶️ How to Run

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/insurance-automation-playwright.git
   cd insurance-automation-playwright
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Add your credentials to a `.env` file (see below).

4. Run all tests:
   ```bash
   npx playwright test
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following format:

```env
BSE_USER_1=username1
BSE_PASS_1=password1
BSE_USER_2=username2
BSE_PASS_2=password2
BSE_USER_3=username3
BSE_PASS_3=password3

PORTO_USER_1=usernameA
PORTO_PASS_1=passwordA
PORTO_USER_2=usernameB
PORTO_PASS_2=passwordB
PORTO_USER_3=usernameC
PORTO_PASS_3=passwordC
```

⚠️ **Do not commit your `.env` file.** It's excluded via `.gitignore`.

---

## ✅ Use Cases

- Automating insurance report handling
- QA Automation practice with real-world complexity
- Demonstrating UI automation skills in interviews
- Replacing manual data collection processes

---

## 🧠 QA Learnings and Demonstrated Skills

This project reflects several QA automation skills:

- Automating login, navigation, dropdown selection, and file download
- Using assertions with `expect()` to validate functional outcomes
- Waiting for dynamic UI state changes (e.g., `estadopendiente` → `estadodisponible`)
- Handling retries and conditional logic
- Managing multiple users and workflows in a single test
- Writing readable and maintainable test scripts
- Capturing clean, informative logs

---

## 📌 Future Improvements

- Integrate with [n8n](https://n8n.io/) for scheduled execution and Google Sheets integration
- Compare data against historical records to detect changes
- Upload extracted data to Google Sheets automatically
- Add screenshots or video recording for visual traceability
- Move execution to the cloud (e.g., GitHub Actions or Railway)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
