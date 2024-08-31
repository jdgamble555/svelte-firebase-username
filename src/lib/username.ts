import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const usernameAvailable = async (username: string) => {

    const snap = await getDoc(
        doc(db, 'usernames', username)
    );

    return !snap.exists();
};