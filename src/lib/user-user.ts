import {
    GoogleAuthProvider,
    onIdTokenChanged,
    signInWithPopup,
    signOut,
    updateEmail,
    updateProfile,
    reauthenticateWithPopup,
    type User
} from "firebase/auth";
import { readable, type Subscriber } from "svelte/store";
import { auth } from "./firebase";
import { useSharedStore, useWritable } from "./use-shared";
import { FirebaseError } from "firebase/app";
import { dev } from "$app/environment";

export const loginWithGoogle = async () =>
    await signInWithPopup(
        auth, new GoogleAuthProvider()
    );

export const reLoginWithGoogle = async () => {
    if (auth.currentUser) {
        await reauthenticateWithPopup(
            auth.currentUser,
            new GoogleAuthProvider()
        );
    }
}

export const logout = async () => await signOut(auth);

const user = (defaultUser: UserType | null = null) =>
    readable<UserType | null>(
        defaultUser,
        (set: Subscriber<UserType | null>) => {
            return onIdTokenChanged(auth, (_user: User | null) => {
                if (!_user) {
                    set(null);
                    return;
                }
                _user.getIdTokenResult()
                    .then((results) => {
                        const username = results.claims.username as string || null;                    
                        const { displayName, photoURL, uid, email } = _user;
                        if (dev) {
                            console.log(results);
                        }
                        set({ displayName, photoURL, uid, email, username });
                    });

            });
        }
    );

export const useUser = (defaultUser: UserType | null = null) =>
    useSharedStore('user', user, defaultUser);

export const useRelogin = () => useWritable('relogin', false);

export const updateProfileEmail = async (
    email: string
) => {

    if (!auth.currentUser) {
        return {
            error: 'Not Logged In!'
        };
    }
    try {
        await updateEmail(auth.currentUser, email);
    } catch (e) {
        if (e instanceof FirebaseError) {
            return {
                error: e.message
            };
        }
    }
    return {};
};

export const updateUser = async (
    displayName: string,
    photoURL: string
) => {

    if (!auth.currentUser) {
        return {
            error: 'Not Logged In!'
        };
    }
    try {
        await updateProfile(auth.currentUser, {
            displayName,
            photoURL
        });
    } catch (e) {
        if (e instanceof FirebaseError) {
            return {
                error: e.message
            };
        }
    }
    return {};
};