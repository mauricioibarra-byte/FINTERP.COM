FROM public.ecr.aws/lambda/nodejs:20 as builder

WORKDIR /usr/app

# Copy root manifest references to install dependencies correctly in a monorepo context
# We need shared-utils tgz or source. 
# SIMPLIFICATION: We will assumes the build context is apps/backend and we manually handled shared-utils 
# OR broadly, we can assume the monorepo structure.
# BETTER: Let's assume the context is 'apps/backend' but we need shared-utils.
# CDK 'fromImageAsset' usually takes one directory. If we point to apps/backend, we miss shared-utils if it's outside.
# STRATEGY: We will bundle shared-utils LOCALLY first (npm pack) like we did for manual, then copy the tgz into the Docker context.

# Wait, CDK fromImageAsset logic is tricky with monorepos.
# Simplest approach: "Self-contained backend".
# I'll re-use the 'npm pack' trick from prepare-lambda.js but inside the Dockerfile? 
# No, Dockerfile cannot reach outside its context.
# So I will COPY the local 'apps/backend/lambda-package' structure since it was already "The Perfect Package" just needing an OS environment.
# NO. That limits us.
# LET'S DO IT PROPERLY:
# We will use the 'apps/backend' as context.
# We expect 'finterp-shared-utils-0.0.1.tgz' to be present in apps/backend (I'll move it there).

COPY package.json package-lock.json ./

# Copy the local tgz for shared-utils (I will ensure this file exists before build)
COPY finterp-shared-utils-0.0.1.tgz ./

# Install ALL dependencies (including dev) for building
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client (Native to Linux now!)
RUN npx prisma generate

# Build NestJS
RUN npm run build


# --- RELEASE STAGE ---
FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package.json and the tgz again
COPY package.json package-lock.json finterp-shared-utils-0.0.1.tgz ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy generated Prisma Client from builder
COPY --from=builder /usr/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy compiled code
COPY --from=builder /usr/app/dist ./

# Copy Prisma Config (Schema)
COPY --from=builder /usr/app/prisma/schema.prisma ./prisma/schema.prisma

# Copy the binary explicitly if needed, but 'npm install' + 'prisma generate' in builder usually puts it in @prisma/client. 
# We'll allow the Engine to be found in node_modules automatically or explicit path.
# Let's trust the standard path first.

# Set the handler
CMD [ "lambda.handler" ]
