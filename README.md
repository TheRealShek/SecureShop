# Secure E-commerce Microservices Platform

A modern, containerized e-commerce platform built with microservices architecture and comprehensive DevSecOps practices.

## Architecture Overview

### Frontend
- **Technology**: HTML, CSS, JavaScript
- **Description**: Simple, responsive e-commerce interface

### Backend Microservices (Go)
- **Product Service**: Manages product catalog, inventory, and pricing
- **User Service**: Handles user authentication, profiles, and authorization
- **Order Service**: Processes orders, payments, and order history

## Tech Stack

### Development
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Go (Golang)
- **Architecture**: Microservices

### Infrastructure & DevOps
- **Containerization**: Docker
- **Container Registry**: DockerHub
- **CI/CD**: Jenkins
- **GitOps**: ArgoCD
- **Orchestration**: Kubernetes
- **Secrets Management**: HashiCorp Vault
- **Monitoring**: Prometheus + Grafana
- **Cloud**: AWS (EKS, EC2, S3)

### Security
- **Static Analysis**: SonarQube
- **Container Security**: Trivy (vulnerability scanning)
- **Secret Injection**: Vault → Kubernetes Secrets

## Project Structure

```
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── services/
│   ├── product-service/
│   ├── user-service/
│   └── order-service/
├── deployments/
│   ├── docker/
│   ├── kubernetes/
│   └── helm/
├── ci-cd/
│   ├── jenkins/
│   └── argocd/
├── monitoring/
│   ├── prometheus/
│   └── grafana/
└── docs/
```

## Development Setup

### Prerequisites
- Go 1.21+
- Docker & Docker Compose
- Node.js (for frontend tooling)
- kubectl
- Helm

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure-ecommerce-platform
   ```

2. **Start services locally**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Product Service: http://localhost:8001
   - User Service: http://localhost:8002
   - Order Service: http://localhost:8003

## CI/CD Pipeline

### Jenkins Pipeline Flow
1. **Code Push** → GitHub webhook triggers Jenkins
2. **Static Analysis** → SonarQube code quality checks
3. **Build & Test** → Go services compilation and testing
4. **Security Scanning** → Trivy vulnerability assessment
5. **Containerization** → Docker image creation
6. **Registry Push** → DockerHub deployment
7. **GitOps Trigger** → ArgoCD deployment initiation

### ArgoCD Deployment
- **Source**: GitHub repository manifests
- **Destination**: Kubernetes cluster
- **Sync Policy**: Automatic with self-healing
- **Secrets**: Injected from Vault

## Security Features

### Container Security
- Multi-stage Docker builds
- Non-root user execution
- Minimal base images
- Regular vulnerability scanning

### Application Security
- JWT-based authentication
- Input validation and sanitization
- HTTPS enforcement
- Rate limiting

### Infrastructure Security
- Network policies
- RBAC implementation
- Secrets encryption at rest
- Pod security standards

## Monitoring & Observability

### Metrics (Prometheus)
- Application performance metrics
- Infrastructure resource usage
- Custom business metrics
- Alert rules configuration

### Visualization (Grafana)
- Real-time dashboards
- Performance monitoring
- Alert notifications
- Historical trend analysis

## API Documentation

### Product Service
- `GET /products` - List all products
- `GET /products/{id}` - Get product details
- `POST /products` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product

### User Service
- `POST /users/register` - User registration
- `POST /users/login` - User authentication
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

### Order Service
- `POST /orders` - Create new order
- `GET /orders` - List user orders
- `GET /orders/{id}` - Get order details
- `PUT /orders/{id}/status` - Update order status

## Deployment

### Kubernetes Deployment
```bash
# Deploy to Kubernetes
kubectl apply -f deployments/kubernetes/

# Or using Helm
helm install ecommerce-platform deployments/helm/
```

### Environment Variables
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_URL` - Redis cache connection
- `AWS_REGION` - AWS region for services

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the troubleshooting guide

---

**Built with ❤️ using modern DevSecOps practices**