#!/usr/bin/env bash
set -e

API_URL="${1:-http://localhost:8000}"

echo "=== Seeding Lead Gen Automation Database ==="
echo "Target API: $API_URL"
echo ""

echo "[1/3] Creating sample leads..."

curl -s -X POST "$API_URL/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Chen",
    "email": "sarah@techstartup.io",
    "company": "TechStartup Inc",
    "title": "CEO",
    "industry": "SaaS",
    "location": "San Francisco, CA",
    "linkedin_url": "https://linkedin.com/in/sarahchen",
    "website": "https://techstartup.io"
  }' | python3 -m json.tool 2>/dev/null || true

curl -s -X POST "$API_URL/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Marcus Johnson",
    "email": "marcus@ecommercepro.com",
    "company": "EcommercePro",
    "title": "Marketing Director",
    "industry": "E-commerce",
    "location": "Austin, TX",
    "linkedin_url": "https://linkedin.com/in/marcusjohnson",
    "website": "https://ecommercepro.com"
  }' | python3 -m json.tool 2>/dev/null || true

curl -s -X POST "$API_URL/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emily Rodriguez",
    "email": "emily@growthlab.co",
    "company": "GrowthLab",
    "title": "Head of Growth",
    "industry": "Marketing",
    "location": "New York, NY",
    "linkedin_url": "https://linkedin.com/in/emilyrodriguez",
    "website": "https://growthlab.co"
  }' | python3 -m json.tool 2>/dev/null || true

curl -s -X POST "$API_URL/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "David Park",
    "email": "david@innovateai.com",
    "company": "InnovateAI",
    "title": "CTO",
    "industry": "AI/ML",
    "location": "Seattle, WA",
    "linkedin_url": "https://linkedin.com/in/davidpark",
    "website": "https://innovateai.com"
  }' | python3 -m json.tool 2>/dev/null || true

curl -s -X POST "$API_URL/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lisa Thompson",
    "email": "lisa@designstudio.com",
    "company": "Design Studio Co",
    "title": "Founder",
    "industry": "Design",
    "location": "Los Angeles, CA",
    "linkedin_url": "https://linkedin.com/in/lisathompson",
    "website": "https://designstudio.com"
  }' | python3 -m json.tool 2>/dev/null || true

echo "  5 leads created."
echo ""

echo "[2/3] Creating sample campaign..."

curl -s -X POST "$API_URL/api/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 2026 Outreach",
    "description": "Outreach campaign targeting tech startups and e-commerce companies for video marketing services",
    "status": "active",
    "target_industry": "SaaS",
    "target_location": "United States",
    "start_date": "2026-01-15",
    "email_sequence_length": 3,
    "follow_up_interval_days": 4
  }' | python3 -m json.tool 2>/dev/null || true

echo "  1 campaign created."
echo ""

echo "[3/3] Creating sample email template..."

curl -s -X POST "$API_URL/api/email-templates" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Initial Outreach",
    "subject": "Quick question about {company}'s video strategy",
    "body": "Hi {first_name},\n\nI noticed {company} is doing great work in the {industry} space. I help companies like yours boost engagement through strategic video content.\n\nWould you be open to a quick 15-minute chat this week?\n\nBest,\n{sender_name}",
    "template_type": "initial",
    "variables": ["first_name", "company", "industry", "sender_name"]
  }' | python3 -m json.tool 2>/dev/null || true

echo "  1 email template created."
echo ""

echo "=== Seeding Complete ==="
echo "  5 leads, 1 campaign, 1 email template created."
