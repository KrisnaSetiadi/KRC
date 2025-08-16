import { db, storage, auth } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateEmail, updatePassword } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import type { User, Submission, UnsavedSubmission } from './types';

// User Management
export const createUserAccount = async (userData: Omit<User, 'id' | 'status' | 'role'>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: userData.name,
        division: userData.division,
        email: userData.email,
        status: 'pending',
        role: 'user'
    });
    return user.uid;
};

export const approveUserAccount = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { status: 'approved' });
};

export const getUser = async (uid: string): Promise<User | null> => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as User;
    }
    return null;
}

export const getAllUsers = async (): Promise<User[]> => {
    const usersCollection = collection(db, "users");
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
};

export const updateUserEmail = async (user: any, newEmail: string) => {
    if (auth.currentUser !== user) {
        throw new Error("Re-authentication needed");
    }
    await updateEmail(user, newEmail);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { email: newEmail });
}

export const updateUserPass = async (user: any, newPass: string) => {
    if (auth.currentUser !== user) {
        throw new Error("Re-authentication needed");
    }
    await updatePassword(user, newPass);
}


export const deleteUserAccount = async (uid: string) => {
    // This is a placeholder for a more complex process
    // In a real app, you would need to handle this with a backend function
    // to properly delete user data from all services.
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
    // Note: This does not delete the user from Firebase Auth.
    // That requires a backend function (e.g., Cloud Functions).
};


// Submission Management
export const createSubmission = async (submissionData: UnsavedSubmission): Promise<string> => {
    const imageUrls = await Promise.all(
        submissionData.images.map(async (image) => {
            const storageRef = ref(storage, `submissions/${uuidv4()}`);
            await uploadString(storageRef, image, 'data_url');
            return await getDownloadURL(storageRef);
        })
    );

    const submissionCollection = collection(db, "submissions");
    const docRef = await addDoc({
        ...submissionData,
        images: imageUrls,
        timestamp: new Date().toISOString(),
    });
    return docRef.id;
};


export const getAllSubmissions = async (): Promise<Submission[]> => {
    const submissionsCollection = collection(db, "submissions");
    const submissionSnapshot = await getDocs(submissionsCollection);
    return submissionSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Submission));
};

export const getSubmissionsByUserId = async (userId: string): Promise<Submission[]> => {
    const submissionsCollection = collection(db, "submissions");
    const q = query(submissionsCollection, where("userId", "==", userId));
    const submissionSnapshot = await getDocs(q);
    return submissionSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Submission));
};

export const updateSubmission = async (submissionId: string, data: Partial<Submission>) => {
    const submissionRef = doc(db, "submissions", submissionId);
    await updateDoc(submissionRef, data);
};

export const deleteSubmission = async (submissionId: string) => {
    const submissionRef = doc(db, "submissions", submissionId);
    const submissionSnap = await getDoc(submissionRef);
    const submissionData = submissionSnap.data() as Submission | undefined;

    if(submissionData?.images) {
        await Promise.all(
            submissionData.images.map(imageUrl => {
                const imageRef = ref(storage, imageUrl);
                return deleteObject(imageRef);
            })
        );
    }
    await deleteDoc(submissionRef);
};

export {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
}
