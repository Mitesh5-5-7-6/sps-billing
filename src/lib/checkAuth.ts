import { getServerSession } from 'next-auth';
import { unauthorized } from './apiResponse';

export async function checkAuth() {
    const session = await getServerSession();
    if (!session) {
        return unauthorized();
    }
    return session;
}