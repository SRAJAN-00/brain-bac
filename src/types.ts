import { ObjectId } from "mongoose";

// User Types
export interface IUser {
  _id: ObjectId;
  username: string;
  password: string;
}

// Content Types
export interface IContent {
  _id: ObjectId;
  link: string;
  title: string;
  tags: ObjectId[];
  type: "youtube" | "twitter";
  notes: string;
  userId: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Request Types
export interface CreateContentRequest {
  title: string;
  link: string;
  type: "youtube" | "twitter";
  notes?: string;
}

export interface UpdateContentRequest {
  title?: string;
  link?: string;
  notes?: string;
}

// Response Types
export interface ContentResponse {
  _id: string;
  link: string;
  title: string;
  type: "youtube" | "twitter";
  notes: string;
  userId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
