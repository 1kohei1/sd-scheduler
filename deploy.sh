# Build the project
yarn build

# Edit .gitignore to track .next
mv .gitignore .original-gitignore
cat .original-gitignore | sed '/.next/g' > .gitignore

# Edit package.json build script
mv package.json original-package.json
cat original-package.json | sed 's/[[:blank:]]*"build"[[:blank:]]*\:[[:blank:]]*".*"/"build": "echo Hello"/g' > package.json

# Deploy to now
now --public

# Revert change
mv original-package.json package.json
mv .original-gitignore .gitignore