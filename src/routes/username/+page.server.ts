import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { FirebaseError } from 'firebase/app';
import { adminAuth, adminDB } from '$lib/firebase-admin';

export const load = (async () => {


}) satisfies PageServerLoad;


export const actions = {

    updateUsername: async ({ request }) => {

        const { username, idToken } = Object.fromEntries(
            await request.formData()
        );

        if (!idToken || typeof idToken !== 'string') {
            error(401, 'Invalid Token!');
        }

        if (!username || typeof username !== 'string') {
            return fail(401, { message: 'Invalid Username Input!' });
        }

        // match alphanumeric or '.' character
        const usernameRegex = /^[a-zA-Z0-9]+(?:[._][a-zA-Z0-9]+)*$/;

        if (!username.match(usernameRegex)) {
            return fail(401, { message: 'Invalid Username!' });
        }

        const token = await adminAuth.verifyIdToken(idToken);

        if (!token) {
            error(401, 'Unauthorized!');
        }

        const uid = token.uid;

        // get current username if exists
        const querySnap = await adminDB
            .collection('usernames')
            .where('uid', '==', uid)
            .get();

        const batch = adminDB.batch();

        // delete current username if exists
        if (!querySnap.empty) {

            querySnap.docs.forEach((snap) => {
                batch.delete(
                    adminDB.doc(`usernames/${snap.id}`)
                )
            });
        }

        // add new username
        try {
            batch.set(
                adminDB.doc(`usernames/${username}`),
                {
                    uid,
                    username
                }
            );

            batch.set(
                adminDB.doc(`users/${uid}`),
                {
                    username
                },
                { merge: true }
            );

            await batch.commit();

        } catch (e) {
            if (e instanceof FirebaseError) {
                error(400, e.message);
            }
        }

        // set username custom claim
        try {
            await adminAuth.setCustomUserClaims(uid, {
                username
            });
        } catch (e) {
            if (e instanceof FirebaseError) {
                error(400, e.message);
            }
        }

        return {
            success: true
        };
    }

} satisfies Actions;