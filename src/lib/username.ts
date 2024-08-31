import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { FirebaseError } from "firebase/app";

export const usernameAvailable = async (
    username: string
) => {
    try {
        const snap = await getDoc(
            doc(db, 'usernames', username)
        );
        return {
            available: !snap.exists(),
            error: null
        };
    } catch (e) {
        if (e instanceof FirebaseError) {
            return {
                error: e.message,
                available: null
            };
        }
    }
    return {
        error: null,
        available: null
    };
};