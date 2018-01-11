# Build the project
yarn build

# Edit package.json not to build in now
mv package.json original-package.json
cat original-package.json | 
sed '/[[:blank:]]*"prebuild"[[:blank:]]*\:[[:blank:]]*".*"/g' | 
sed 's/[[:blank:]]*"build"[[:blank:]]*\:[[:blank:]]*".*"/"build": "echo Hello"/g' > package.json

# Copy edited package.json to .dist
cat package.json > .dist/package.json

# Move to .dist folder
cd .dist

# Deploy to now
now --public

# Move back to project parent folder
cd ../

# Revert change
mv original-package.json package.json