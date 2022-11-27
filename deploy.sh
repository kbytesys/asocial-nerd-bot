gcloud functions deploy asocial-nerd-bot \
  --entry-point=asocialNerdBot \
  --gen2 \
  --region=europe-west2 \
  --runtime nodejs16 \
  --trigger-http \
  --env-vars-file .env.yaml \
  --ingress-settings all \
  --allow-unauthenticated
