-- CreateTable
CREATE TABLE "admin_otps" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_otps_user_id_idx" ON "admin_otps"("user_id");

-- AddForeignKey
ALTER TABLE "admin_otps" ADD CONSTRAINT "admin_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
