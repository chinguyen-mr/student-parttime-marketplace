const profileRepository = require('../../database/repositories/profile.repository');
const userRepository = require('../../database/repositories/user.repository');
const { NotFoundError } = require('../../utils/app-error');

class ProfileService {
    async getProfile(userId) {
        const profile = await profileRepository.findByUserId(userId);
        if (!profile) {
            const user = await userRepository.findById(userId);
            if (!user) throw new NotFoundError('Người dùng không tồn tại');
            return profileRepository.upsert(userId, {});
        }
        return profile;
    }

    async updateProfile(userId, updateData) {
        return profileRepository.upsert(userId, updateData);
    }
}

module.exports = new ProfileService();
