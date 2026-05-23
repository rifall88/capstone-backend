import prisma from "../databases/dbPrisma.js";

class AuthModel {
  static async verifyOtp(otpEntryId, userId) {
    return prisma.$transaction([
      prisma.otpLog.update({
        where: { id: otpEntryId },
        data: { is_used: true },
      }),

      prisma.user.update({
        where: { id: userId },
        data: { is_verified: true },
      }),
    ]);
  }
}

export default AuthModel;
