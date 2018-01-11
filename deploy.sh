# Build the project
yarn build

# Edit .gitignore to track .next
# mv .gitignore .original-gitignore
# cat .original-gitignore > .gitignore
# cat .gitignore | sed '/.next/g' > .gitignore
# cat .gitignore | sed '/.dist/g' > .gitignore

# Edit package.json build script
mv package.json original-package.json
cat original-package.json > package.json
cat package.json | sed 's/[[:blank:]]*"prebuild"[[:blank:]]*\:[[:blank:]]*".*"/"prebuild": "echo Hello"/g' > package.json
cat package.json | sed 's/[[:blank:]]*"build"[[:blank:]]*\:[[:blank:]]*".*"/"build": "echo Hello"/g' > package.json

# Copy edited package.json to .dist
cat package.json > .dist/package.json

# Move to .dist folder
cd .dist

# Deploy to now
# now --public

# Move back to project parent folder
# cd ../

# Revert change
# mv original-package.json package.json
# mv .original-gitignore .gitignore