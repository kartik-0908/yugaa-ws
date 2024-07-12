import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const extractUserId = (token: string) => {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
};

export async function getUserRoleAndDomain(userId: any): Promise<{role: string, shopDomain: string}> {
    const res = await axios.post(`${process.env.BASE_API_URL}/v1/user/getRoleDomain`, { userId });
    const { role } = res.data;
    const { shopDomain } = res.data;
    return {
        role: role,
        shopDomain: shopDomain
    };
}

