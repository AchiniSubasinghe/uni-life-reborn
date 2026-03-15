import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/config/firebase.config";
import { BusinessPost } from "@/types";
import { getBusinessById } from "./business-service";

const BUSINESS_POSTS_COLLECTION = "businessPosts";

export async function createBusinessPost(
  businessId: string,
  providerId: string,
  providerName: string,
  title: string,
  content: string,
  image?: File
): Promise<string> {
  const business = await getBusinessById(businessId);

  if (!business) {
    throw new Error("Business not found");
  }

  if (business.providerId !== providerId) {
    throw new Error("Only the business owner can create posts");
  }

  let imageUrl: string | undefined;
  if (image) {
    const fileName = `${Date.now()}_${image.name}`;
    const storageRef = ref(storage, `business-posts/${businessId}/${fileName}`);
    await uploadBytes(storageRef, image);
    imageUrl = await getDownloadURL(storageRef);
  }

  const postRef = await addDoc(collection(db, BUSINESS_POSTS_COLLECTION), {
    businessId,
    providerId,
    providerName,
    title,
    content,
    imageUrl: imageUrl || null,
    createdAt: serverTimestamp(),
  });

  return postRef.id;
}

export async function getBusinessPosts(businessId: string): Promise<BusinessPost[]> {
  const q = query(
    collection(db, BUSINESS_POSTS_COLLECTION),
    where("businessId", "==", businessId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((snapshotDoc) => ({
    id: snapshotDoc.id,
    ...snapshotDoc.data(),
  })) as BusinessPost[];
}

export async function getProviderPosts(providerId: string): Promise<BusinessPost[]> {
  const q = query(
    collection(db, BUSINESS_POSTS_COLLECTION),
    where("providerId", "==", providerId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((snapshotDoc) => ({
    id: snapshotDoc.id,
    ...snapshotDoc.data(),
  })) as BusinessPost[];
}

export async function updateBusinessPost(
  postId: string,
  providerId: string,
  payload: { title?: string; content?: string }
): Promise<void> {
  const postRef = doc(db, BUSINESS_POSTS_COLLECTION, postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error("Post not found");
  }

  const post = postSnap.data() as BusinessPost;

  if (post.providerId !== providerId) {
    throw new Error("Only the post owner can update this post");
  }

  await updateDoc(postRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBusinessPost(
  postId: string,
  providerId: string
): Promise<void> {
  const postRef = doc(db, BUSINESS_POSTS_COLLECTION, postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error("Post not found");
  }

  const post = postSnap.data() as BusinessPost;

  if (post.providerId !== providerId) {
    throw new Error("Only the post owner can delete this post");
  }

  if (post.imageUrl) {
    try {
      await deleteObject(ref(storage, post.imageUrl));
    } catch (error) {
      console.error("Failed to remove post image:", error);
    }
  }

  await deleteDoc(postRef);
}
