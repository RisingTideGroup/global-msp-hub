
#!/bin/sh

# Supabase deployment script
set -e

echo "Setting up Supabase CLI..."

# Check required environment variables
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "Error: SUPABASE_PROJECT_ID environment variable is required"
    exit 1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "Error: SUPABASE_ACCESS_TOKEN environment variable is required"
    exit 1
fi

# Login to Supabase using access token
echo "Logging into Supabase..."
echo "$SUPABASE_ACCESS_TOKEN" | supabase auth login --token

# Link to the project
echo "Linking to Supabase project: $SUPABASE_PROJECT_ID"
supabase link --project-ref "$SUPABASE_PROJECT_ID"

# Deploy database migrations
echo "Deploying database migrations..."
if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations)" ]; then
    supabase db push
    echo "Database migrations deployed successfully"
else
    echo "No migrations found, skipping database deployment"
fi

# Deploy edge functions
echo "Deploying edge functions..."
if [ -d "supabase/functions" ] && [ "$(ls -A supabase/functions)" ]; then
    supabase functions deploy
    echo "Edge functions deployed successfully"
else
    echo "No edge functions found, skipping function deployment"
fi

echo "Supabase deployment completed successfully!"
