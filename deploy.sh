# Build the project
yarn build

# Edit package.json not to build in now
mv package.json original-package.json
cat original-package.json | 
sed '/[[:blank:]]*"prebuild"[[:blank:]]*\:[[:blank:]]*".*"/g' | 
sed 's/[[:blank:]]*"build"[[:blank:]]*\:[[:blank:]]*".*"/"build": "echo Hello"/g' > package.json

# Copy edited package.json to .dist
cat package.json > .dist/package.json

# Move production environment file to .dist
cat .env.production > .dist/.env.production

# Move to .dist folder
cd .dist

# Deploy to now
now --public --dotenv=.env.production 
deploy=`pbpaste`
now alias $deploy sd-scheduler.com

# Move back to project parent folder
cd ../

# Revert change
mv original-package.json package.json