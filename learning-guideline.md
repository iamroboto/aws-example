# AWS Backend Interview Hands-on Project

## 1. Mục tiêu

Xây dựng một backend project thực tế để luyện phỏng vấn Backend Developer có yêu cầu AWS.

Project phải giúp tôi hands-on và hiểu sâu các chủ đề:

* Backend API
* Docker
* Git/GitHub
* AWS IAM
* AWS VPC
* EC2
* ALB
* ECS/Fargate
* ECR
* RDS PostgreSQL
* S3
* CloudFront
* SQS
* SNS
* Lambda
* API Gateway
* DynamoDB
* ElastiCache/Redis
* CloudWatch
* KMS
* Secrets Manager / Parameter Store
* Auto Scaling
* High Availability
* Security
* Asynchronous processing
* CI/CD
* Infrastructure as Code với Terraform

Mục tiêu không phải chỉ biết cách sử dụng từng AWS service, mà phải hiểu:

1. Service dùng để làm gì?
2. Khi nào nên dùng?
3. Khi nào không nên dùng?
4. Các service kết hợp với nhau như thế nào?
5. Trade-off của từng lựa chọn?
6. Những vấn đề production thực tế?
7. Cách giải thích architecture trong interview?

---

# 2. Tech Stack

## Backend

* NestJS
* TypeScript
* REST API
* PostgreSQL
* TypeORM hoặc Prisma

## Infrastructure

* Docker
* Docker Compose
* Terraform

## AWS

* VPC
* IAM
* EC2
* ALB
* ECS
* Fargate
* ECR
* RDS PostgreSQL
* S3
* CloudFront
* SQS
* SNS
* Lambda
* API Gateway
* DynamoDB
* ElastiCache Redis
* CloudWatch
* KMS
* Secrets Manager hoặc Parameter Store

## Source Control

* Git
* GitHub

---

# 3. Project Domain

Xây dựng một hệ thống đơn giản tên:

`AWS Backend Interview System`

Domain là một hệ thống quản lý users, files và background jobs.

Các chức năng chính:

### User

* Create user
* Get users
* Get user by ID
* Update user
* Delete user

### File

* Generate S3 presigned upload URL
* Upload file trực tiếp từ client lên S3
* Generate download URL

### Background Job

* Submit job
* Push job vào SQS
* Worker xử lý job
* Retry failed job
* Dead Letter Queue

### Notification

* Publish event bằng SNS
* Các consumer nhận event thông qua SQS

### Cache

* Cache user/product data bằng Redis
* Cache-aside pattern
* TTL
* Cache invalidation

### Serverless

Có ít nhất một Lambda function xử lý background/event-driven task.

---

# 4. Target Architecture

Architecture cuối cùng hướng tới:

```text
                         Internet
                            |
                            v
                     Route 53 / DNS
                            |
                            v
                       CloudFront
                            |
                            v
                           ALB
                            |
                +-----------+-----------+
                |                       |
                v                       v
           ECS/Fargate             ECS/Fargate
           Backend Task            Backend Task
                |                       |
                +-----------+-----------+
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
             RDS          Redis          S3
         PostgreSQL     ElastiCache      Storage
              |
              |
              v
             Data


Backend
   |
   v
  SQS
   |
   v
Worker / Lambda
   |
   +----> Database
   |
   +----> S3


Backend
   |
   v
  SNS
   |
   +--------> SQS Email
   |
   +--------> SQS Notification
   |
   +--------> SQS Analytics


CloudWatch
   |
   +---- Logs
   +---- Metrics
   +---- Alarms


IAM
   |
   +---- ECS Task Role
   +---- Lambda Role
   +---- EC2 Role
   +---- CI/CD Role
```

---

# 5. Network Architecture

Thiết kế VPC theo hướng production-like:

```text
VPC
|
+-- Public Subnet AZ-a
|      |
|      +-- ALB
|
+-- Public Subnet AZ-b
|      |
|      +-- ALB
|
+-- Private App Subnet AZ-a
|      |
|      +-- ECS Task
|
+-- Private App Subnet AZ-b
|      |
|      +-- ECS Task
|
+-- Private DB Subnet AZ-a
|      |
|      +-- RDS
|
+-- Private DB Subnet AZ-b
|      |
|      +-- RDS
|
+-- NAT Gateway
|
+-- Internet Gateway
```

Phải hiểu rõ:

* Public subnet
* Private subnet
* Route Table
* Internet Gateway
* NAT Gateway
* Security Group
* Network ACL
* Availability Zone

---

# 6. Security Rules

Không hard-code:

* AWS Access Key
* AWS Secret Key
* Database password
* API secret

Sử dụng:

* IAM Role
* Secrets Manager hoặc Parameter Store
* KMS
* Security Group
* Private subnet

Database không được expose trực tiếp ra Internet.

S3 bucket mặc định private.

ECS task chỉ có quyền IAM cần thiết.

Áp dụng principle:

`Least Privilege`

---

# 7. Development Phases

Không xây toàn bộ architecture ngay từ đầu.

Phải triển khai từng milestone.

## Phase 1 — Backend

Xây:

```text
NestJS
   |
   v
PostgreSQL
```

API:

```text
POST   /users
GET    /users
GET    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

---

## Phase 2 — Git

Thiết lập:

```text
Git
 |
 v
GitHub
```

Commit theo milestone:

```text
initial backend
add postgres
add users API
add docker
...
```

Không commit:

```text
.env
credentials
secrets
```

---

# 8. Phase 3 — Docker

Dockerize backend:

```text
NestJS
   |
Docker Image
```

Docker Compose:

```text
Backend Container
       |
       v
PostgreSQL Container
```

Mục tiêu:

```bash
docker compose up
```

có thể chạy toàn bộ application.

---

# 9. Phase 4 — AWS IAM

Học và hands-on:

* IAM User
* IAM Group
* IAM Role
* IAM Policy
* Resource-based policy
* Identity-based policy
* Least privilege
* AssumeRole

Đặc biệt phải hiểu:

```text
Application
    |
    v
IAM Role
    |
    v
AWS Service
```

Không dùng Access Key hard-code trong application.

---

# 10. Phase 5 — AWS VPC

Tự xây VPC bằng Terraform.

Phải có:

* VPC
* 2 Availability Zones
* Public subnets
* Private App subnets
* Private DB subnets
* Internet Gateway
* NAT Gateway
* Route Tables
* Security Groups

Test network connectivity thực tế.

Ví dụ:

```text
Internet -> ALB              YES
Internet -> ECS directly     NO
Internet -> RDS              NO
ALB -> ECS                   YES
ECS -> RDS                   YES
ECS -> Internet              YES via NAT
```

---

# 11. Phase 6 — EC2

Deploy backend lên EC2 trước khi chuyển sang ECS.

Architecture:

```text
Internet
   |
   v
EC2
   |
   v
Docker
   |
   v
NestJS
```

Hands-on:

* Launch EC2
* Security Group
* IAM Role
* SSH
* Install Docker
* Deploy container
* CloudWatch logs
* Environment configuration

Mục tiêu là hiểu EC2 trước khi dùng ECS.

---

# 12. Phase 7 — RDS

Thay PostgreSQL local bằng:

```text
ECS/EC2
    |
    v
RDS PostgreSQL
```

Hands-on:

* RDS
* DB subnet group
* Security Group
* Backup
* Multi-AZ
* Read Replica
* Failover

Phải hiểu:

```text
Multi-AZ
= High Availability

Read Replica
= Read Scaling
```

---

# 13. Phase 8 — S3

Implement file upload.

Không upload file qua backend.

Flow:

```text
Client
   |
   v
Backend
   |
Generate Presigned URL
   |
   v
Client
   |
   v
S3
```

Hands-on:

* S3 bucket
* IAM permission
* Bucket policy
* Presigned URL
* Object key
* Versioning
* Lifecycle
* Encryption
* Private bucket

---

# 14. Phase 9 — SQS

Implement asynchronous job.

```text
Client
   |
   v
Backend
   |
   v
SQS
   |
   v
Worker
   |
   v
Database
```

Hands-on:

* Send message
* Receive message
* Visibility Timeout
* Message retention
* Retry
* DLQ
* Long polling
* At-least-once delivery
* Idempotency

Phải test duplicate message.

---

# 15. Phase 10 — SNS

Implement event-driven architecture.

```text
Backend
   |
   v
SNS Topic
   |
   +----> SQS Email
   |
   +----> SQS Notification
   |
   +----> SQS Analytics
```

Hiểu rõ:

```text
SQS = Queue

SNS = Pub/Sub
```

---

# 16. Phase 11 — Lambda

Implement một Lambda xử lý event.

Ví dụ:

```text
S3
 |
 v
Lambda
 |
 v
Process file
 |
 v
DynamoDB / S3
```

Hoặc:

```text
SQS
 |
 v
Lambda
 |
 v
Process job
```

Hands-on:

* Lambda execution role
* Event source
* Timeout
* Memory
* Cold start
* Concurrency
* Retry
* Dead Letter Queue
* CloudWatch logs

---

# 17. Phase 12 — DynamoDB

Tạo một use case phù hợp với NoSQL.

Ví dụ:

```text
Job status
```

Thiết kế:

```text
PK = USER#123
SK = JOB#456
```

Học:

* Partition Key
* Sort Key
* GSI
* LSI
* Query
* Scan
* Capacity
* On-demand
* Provisioned
* Eventually consistent read
* Strongly consistent read

Không dùng DynamoDB chỉ vì muốn "dùng thêm một AWS service".

Phải hiểu tại sao use case đó phù hợp với DynamoDB.

---

# 18. Phase 13 — Redis / ElastiCache

Implement cache:

```text
GET /users/:id

        |
        v
      Redis
      /   \
    HIT   MISS
     |      |
     |      v
     |     RDS
     |      |
     +------+
```

Học:

* Cache-aside
* TTL
* Cache invalidation
* Cache hit/miss
* Redis
* ElastiCache

---

# 19. Phase 14 — ECS + ECR + Fargate

Chuyển backend từ EC2 sang ECS.

Flow:

```text
Docker
   |
   v
ECR
   |
   v
ECS
   |
   v
Fargate
   |
   v
ALB
```

Hands-on:

* Docker image
* ECR
* ECS Cluster
* Task Definition
* Task
* Service
* Fargate
* ALB
* Health Check
* Target Group
* Auto Scaling

Deploy ít nhất 2 tasks ở 2 AZ.

---

# 20. Phase 15 — CloudFront

Đặt CloudFront trước S3 hoặc ALB tùy use case.

Hiểu:

* CDN
* Cache
* Origin
* Cache policy
* TTL
* Cache invalidation
* HTTPS

---

# 21. Phase 16 — CloudWatch

Thiết lập:

* Application logs
* ECS logs
* Lambda logs
* Metrics
* Alarms

Ví dụ alarm:

```text
CPU > 80%
     |
     v
CloudWatch Alarm
```

Phải biết cách debug production issue bằng CloudWatch.

---

# 22. Phase 17 — Terraform

Toàn bộ infrastructure nên được chuyển sang Terraform.

Structure:

```text
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── provider.tf
├── vpc.tf
├── iam.tf
├── ec2.tf
├── rds.tf
├── s3.tf
├── sqs.tf
├── sns.tf
├── lambda.tf
├── ecs.tf
└── cloudwatch.tf
```

Mục tiêu:

```bash
terraform init
terraform plan
terraform apply
terraform destroy
```

Có thể chia module nếu architecture đủ lớn.

---

# 23. Phase 18 — CI/CD

GitHub:

```text
Developer
    |
    v
Git Push
    |
    v
GitHub Actions
    |
    +--> Test
    |
    +--> Build Docker Image
    |
    +--> Push ECR
    |
    +--> Deploy ECS
```

Không commit AWS credentials vào GitHub.

Ưu tiên sử dụng:

* IAM Role
* OIDC

---

# 24. Interview Questions

Sau mỗi phase, phải tự luyện các câu hỏi:

### IAM

* User vs Role?
* Role dùng khi nào?
* Least privilege?
* Identity policy vs resource policy?

### VPC

* Public vs Private subnet?
* Internet Gateway?
* NAT Gateway?
* Security Group vs NACL?
* Tại sao RDS nên nằm private subnet?

### EC2

* AMI?
* EBS?
* Security Group?
* Auto Scaling?
* Khi nào dùng EC2?

### RDS

* Multi-AZ vs Read Replica?
* Backup?
* Failover?
* Connection pooling?

### S3

* Presigned URL?
* Bucket policy?
* Versioning?
* Lifecycle?
* S3 vs EBS?

### SQS

* Visibility Timeout?
* DLQ?
* Retry?
* At-least-once delivery?
* Idempotency?

### SNS

* SNS vs SQS?
* Fan-out pattern?

### Lambda

* Cold start?
* Timeout?
* Concurrency?
* Retry?
* Khi nào không nên dùng Lambda?

### ECS

* Task vs Service?
* ECS vs EC2?
* ECS vs Lambda?
* Fargate là gì?
* Health check?

### DynamoDB

* Partition key?
* Sort key?
* GSI?
* Query vs Scan?
* Khi nào dùng DynamoDB?

### Architecture

* Làm sao scale backend?
* Làm sao tăng availability?
* Làm sao xử lý traffic spike?
* Làm sao xử lý background jobs?
* Làm sao tránh database overload?
* Làm sao secure production environment?
* Làm sao debug production issue?

---

# 25. Rules cho AI Mentor

AI phải đóng vai trò là AWS Backend Mentor.

Không được dump toàn bộ code ngay lập tức.

Mỗi lần chỉ hướng dẫn một bước nhỏ.

Với mỗi bước:

1. Giải thích mục tiêu.
2. Giải thích architecture.
3. Giải thích tại sao cần làm.
4. Cho tôi command/code cần thiết.
5. Để tôi tự chạy.
6. Đợi tôi báo kết quả.
7. Nếu lỗi thì debug cùng tôi.
8. Sau khi hoàn thành mới sang bước tiếp theo.

Không bỏ qua hands-on.

Không chỉ giải thích lý thuyết.

---

# 26. Learning Philosophy

Ưu tiên:

```text
Hands-on
   >
Understanding
   >
Architecture
   >
Interview explanation
```

Không học AWS service theo kiểu học thuộc definition.

Mỗi service phải trả lời được:

```text
What?
Why?
When?
How?
Trade-offs?
Failure scenarios?
Security?
Cost?
```

---

# 27. Final Goal

Sau khi hoàn thành project, tôi phải có khả năng giải thích architecture này trong interview:

```text
                    Internet
                       |
                  CloudFront
                       |
                      ALB
                       |
              +--------+--------+
              |                 |
           ECS Task          ECS Task
              |                 |
              +--------+--------+
                       |
          +------------+------------+
          |            |            |
         RDS         Redis          S3
          |
          |
        Backend
          |
      +---+---+
      |       |
     SQS     SNS
      |       |
   Worker   SQS consumers
      |
   Lambda
      |
 DynamoDB


CloudWatch -> Logs / Metrics / Alarms
IAM        -> Access Control
KMS        -> Encryption
Terraform  -> Infrastructure
GitHub     -> Source Control
GitHub Actions -> CI/CD
```

Tôi phải có khả năng giải thích:

* Request đi qua hệ thống như thế nào.
* Database nằm ở đâu.
* Vì sao database nằm private subnet.
* Vì sao dùng ALB.
* Vì sao dùng ECS/Fargate.
* Vì sao dùng SQS.
* Vì sao cần DLQ.
* Vì sao cần Redis.
* Vì sao upload file trực tiếp lên S3.
* IAM Role hoạt động như thế nào.
* Làm sao hệ thống scale.
* Làm sao hệ thống high availability.
* Làm sao xử lý failure.
* Làm sao monitor production.
* Làm sao deploy.
* Trade-off giữa các kiến trúc khác nhau.

---

# Starting Point

Bắt đầu từ:

```text
Phase 1
NestJS + PostgreSQL + Docker + Git
```

Không triển khai AWS ngay.

Sau khi Phase 1 hoàn thành, chuyển sang:

```text
Phase 2
IAM + VPC
```

Sau đó:

```text
Phase 3
EC2
```

và tiếp tục từng phase cho đến architecture hoàn chỉnh.

AI phải đóng vai mentor và **chỉ dẫn từng bước, chờ tôi hoàn thành bước hiện tại trước khi chuyển sang bước tiếp theo.**


sg-026e508ac31b39fc8 - aws-example-alb-sg
Downloads/aws-example-key.pem

VPC
6 subnet:
- 2 public
- 4 private
for 2 AZs


IAM:
- AWSBackenDemoRole


EC2:
- in VPC
- public subnet
- IAM: AWSBackenDemoRole
- create keypair for SSH
- security group for BE

Bên trong EC2:
- cài docker

