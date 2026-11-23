# 🚀 DevOps Todo & Goal Tracker on AWS EC2 (No Docker)

A production-grade, full-stack Todo & Goal Tracking application built with **React (Vite)**, **Express.js**, and **MongoDB Atlas**. Provisioned and orchestrated via an end-to-end DevOps CI/CD pipeline using **Terraform**, **Ansible**, and **Nagios Core** directly on an AWS EC2 instance without Docker.

---

## 🏛️ Architecture Overview

```
                      [ User Browser ]
                             │
            HTTP Port 80     │      HTTP Port 8080 (Auth)
       (React SPA + API)     │         (Nagios Core UI)
                             ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    AWS EC2 Instance (Ubuntu 22.04)          │
 │                                                             │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │              Nginx Web Server (Port 80)               │  │
 │  │  • Serves React SPA static build                      │  │
 │  │  • Reverse-proxies /api/ & /health to Express (5001)  │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              │                              │
 │                              ▼                              │
 │  ┌───────────────────────────────────────────────────────┐  │
 │  │      Node.js Express Backend (Port 5001)              │  │
 │  │      • Managed with PM2 Cluster Mode                  │  │
 │  │      • Computes Daily Goals & Weekly Completion Rates │  │
 │  └───────────────────────────┬───────────────────────────┘  │
 │                              │                              │
 │  ┌───────────────────────────▼───────────────────────────┐  │
 │  │            Nagios Core 4 Monitoring (Port 8080)       │  │
 │  │  • Runs under Apache2 on port 8080                    │  │
 │  │  • Probes Nginx (:80), Express (:5001/health), & Node │  │
 │  └───────────────────────────────────────────────────────┘  │
 └──────────────────────────────┼──────────────────────────────┘
                                │
                    TLS Encrypted Mongoose
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    MongoDB Atlas Cluster                    │
 │               Database: `todo_app`                          │
 └─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & DevOps Tooling

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Chart.js, Lucide | UI with daily goal selector, priority tags, and weekly bar charts |
| **Backend** | Node.js, Express.js, Mongoose | REST API with daily goal CRUD and weekly aggregation pipelines |
| **Database** | MongoDB Atlas | Cloud document database storing goals indexed by date & week |
| **Infrastructure as Code** | **Terraform** (AWS Provider) | Automates VPC Security Group, SSH Key, and EC2 instance creation |
| **Configuration Management**| **Ansible** | Automates software installation (Node, PM2, Nginx, Nagios) and deploys app |
| **System Monitoring** | **Nagios Core 4** | Monitors web traffic, Express API health, and system processes on port `8080` |
| **CI/CD Pipeline** | GitHub Actions | End-to-end automation from code push to live EC2 URL |

---

## 📁 Repository Structure

```
devopsTODOapp/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD pipeline (Terraform + Ansible)
│
├── terraform/
│   ├── main.tf                     # Provider definitions (AWS, TLS, Local)
│   ├── variables.tf                # Region, instance type, CIDR configs
│   ├── ec2.tf                      # Security Group, Key Pair, EC2 instance & inventory generation
│   ├── outputs.tf                  # Instance IP, App URL, Health URL, Nagios URL
│   └── inventory.tmpl              # Template for dynamic Ansible inventory
│
├── ansible/
│   ├── ansible.cfg                 # Ansible configuration
│   ├── playbook.yml                # Main multi-role orchestration playbook
│   └── roles/
│       ├── common/                 # System update, Node.js 20, PM2, build-essential
│       ├── nagios/                 # Nagios Core 4, Apache2 (port 8080), service probes
│       ├── backend/                # Code sync, .env template, npm install, PM2 start
│       └── frontend/               # Code sync, npm install, Vite build, Nginx configuration
│
├── backend/
│   ├── models/Todo.js              # Mongoose schema (stores date YYYY-MM-DD, week, status)
│   ├── routes/todos.js             # Daily goals CRUD
│   ├── routes/analytics.js         # Daily & weekly completion rate aggregations
│   ├── utils/dateHelper.js         # ISO week & date formatting
│   ├── server.js                   # Express server with /health endpoint
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MetricsSummary.jsx  # Average goal completion rate card
│   │   │   ├── WeeklyBarChart.jsx  # Chart.js weekly completion bar chart
│   │   │   └── TodoSection.jsx     # Daily goal checklist and form
│   │   ├── api.js                  # Axios client
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚡ How to Deploy via CI/CD Pipeline

### 1. Set Up GitHub Repository Secrets
Under your GitHub repository **Settings** > **Secrets and variables** > **Actions**, add:

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | AWS IAM user credentials with EC2 permissions |
| `AWS_SECRET_ACCESS_KEY` | `wJal...` | AWS IAM secret key |
| `AWS_REGION` | `us-east-1` | Target AWS region (e.g. `us-east-1`, `ap-south-1`) |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas cluster connection string |
| `NAGIOS_PASSWORD` | `MySecurePassword!` | Password for Nagios admin web login (`nagiosadmin`) |

### 2. Trigger the Pipeline
- Push code to the `main` or `master` branch, or
- Manually run the workflow in GitHub Actions (**Actions** > **AWS EC2 CI/CD Pipeline** > **Run workflow**).

### 3. Pipeline Flow
```
[ Code Push / Trigger ]
         │
         ▼
[ Step 1: Validation ] ──► Node.js syntax & dependency check
         │
         ▼
[ Step 2: Terraform ] ──► Provisions EC2, creates Security Group (80, 5001, 8080, 22), generates dynamic inventory
         │
         ▼
[ Step 3: Ansible ]   ──► Installs Node.js 20, PM2, Nginx, Nagios Core 4
                      ──► Configures backend with MongoDB Atlas & starts Express via PM2
                      ──► Compiles React with Vite & configures Nginx reverse proxy
                      ──► Configures custom Nagios service checks for port 80 & /health
         │
         ▼
[ Step 4: Access App ] ──► Live URL: http://<EC2_PUBLIC_IP>
```

---

## 🌐 Accessing Your Deployment in the Browser

Once the pipeline finishes, the EC2 instance's public IP is printed in the GitHub Actions summary and Terraform output:

- **Frontend App**: `http://<EC2_PUBLIC_IP>`  
  *Accessible directly in your browser. Fully functional React UI with daily goal tracking and weekly completion bar chart.*
- **Backend Health Check**: `http://<EC2_PUBLIC_IP>/health` (or `http://<EC2_PUBLIC_IP>:5001/health`)  
  *Returns JSON containing database connectivity state and uptime.*
- **Nagios Monitoring UI**: `http://<EC2_PUBLIC_IP>:8080/nagios`  
  *Login with Username:* `nagiosadmin`  
  *Password:* Value set in `NAGIOS_PASSWORD` (default: `admin123`).

---

## 💻 Manual Local Provisioning (Alternative to GitHub Actions)

If you wish to run Terraform and Ansible from your local terminal:

### 1. Provision AWS Infrastructure with Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```
*This outputs `instance_public_ip` and generates `ansible/inventory.ini` and `terraform/id_rsa`.*

### 2. Configure & Deploy App with Ansible
```bash
cd ../ansible
export MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/todo_app?retryWrites=true&w=majority"
export NAGIOS_PASSWORD="admin123"

ansible-playbook -i inventory.ini playbook.yml
```

### 3. Teardown / Cleanup
When you want to destroy the cloud resources to avoid AWS costs:
```bash
cd terraform
terraform destroy -auto-approve
```
