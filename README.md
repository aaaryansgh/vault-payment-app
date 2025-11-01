

# 💰 VaultPay - Smart Payment & Expense Management App
A modern full-stack payment application with an innovative vault system that helps users organize their expenses by categorizing their money into different spending vaults.

# 🌟 Key Features
- 🏦 Virtual Vaults: Segregate your money into different categories (Groceries, Rent, Entertainment, etc.)
- 💸 Smart Payments: Pay from specific vaults to track spending
- 📊 Expense Analytics: Visual insights into your spending patterns
- 🔒 Secure: Bank-grade security with JWT authentication
- 📱 Responsive: Works perfectly on mobile and desktop
- 🛠️ Tech Stack
## Frontend
- Framework: React.js
- Language: TypeScript
- Styling: Tailwind CSS
- HTTP Client: Axios
- Icons: Lucide React
## Backend
- Runtime: Node.js
- Framework: Express.js
- Language: TypeScript
- Database: PostgreSQL
- Authentication: JWT
- Security: Helmet, CORS, Rate Limiting
## 📁 Project Structure
```text
vault-payment-app/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Entry point
│   └── package.json
│
├── frontend/               # react.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities
│   │   ├── hooks/         # Custom hooks
│   │   └── context/       # React context
│   └── package.json
│
└── README.md
```
🚀 Getting Started
## Prerequisites:
- Node.js 18+ installed
- PostgreSQL 14+ installed
- npm or yarn package manager
- Installation
- Clone the repository
## bash
- git clone https://github.com/aaaryansgh/vault-payment-app.git
- cd vault-payment-app
- Setup Backend
- bash
- cd backend
- npm install
- cp .env.example .env
# Update .env with your configuration
npm run dev
Setup Frontend
bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
Access the application
Frontend: http://localhost:5173
Backend API: http://localhost:5000
 
🎯 Unique Selling Point: Vault System
Unlike traditional payment apps, VaultPay introduces a vault-based money management system:

- Create Vaults: Users create virtual vaults for different expense categories
- Allocate Money: Distribute their total balance across vaults
- Track Spending: Each payment is linked to a specific vault
- Budget Control: Can't overspend from a vault once depleted
Example: User has ₹50,000:
- Rent Vault: ₹15,000
- Groceries Vault: ₹5,000
- Entertainment Vault: ₹3,000
- Savings Vault: ₹10,000
- Unallocated: ₹17,000

🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers

📝 API Documentation
- POST   /api/auth/signup                   - Register new user
- POST   /api/auth/login                    - Login
- GET    /api/auth/me                       - Get current user
- POST   /api/auth/logout                   - Logout
- POST   /api/bank-accounts                 - Link bank account
- GET    /api/bank-accounts                 - Get all accounts
- GET    /api/bank-accounts/primary         - Get primary account
- GET    /api/bank-accounts/:id             - Get specific account
- GET    /api/bank-accounts/:id/summary     - Get account summary
- PATCH  /api/bank-accounts/:id/set-primary - Set as primary
- PATCH  /api/bank-accounts/:id/balance     - Update balance
- DELETE /api/bank-accounts/:id             - Unlink account
- POST /api/vaults/create-vault             - Create vault
- GET  /api/vaults//user-vaults             - get all vaults of user
- GET  /api/vaults/:id                      - get vault by id
- GET /api/vaults/summary                   - get summary of vault        
- PATCH /api/vaults/update/:id              - Update vault info
- DELETE /api/vaults/delete/:id             - Delete vault
- POST  /api/payments/makePayment           - Make payment
- GET api/payments/transactions             - Get transactions
- GET api/payments/transaction/:transactionId - Get transactions by id
- GET api/payments/spending-summary         - Get spending summary of user
- GET api/payments/analytics/vaults/:vaultId  -Get analytics of vault

🤝 Contributing
This is a personal portfolio project, but suggestions are welcome!

📄 License
MIT License - feel free to use this project for learning purposes.

👨‍💻 Author
Aryan

GitHub: @aaaryansgh
LinkedIn:https://www.linkedin.com/in/aryansingh20/
🙏 Acknowledgments
Built as a full-stack portfolio project to demonstrate:
Modern web development practices
Full-stack TypeScript development
Financial application architecture
Clean code and project structure
⭐ Star this repo if you find it helpful!


