import { User } from '../../types';
import { api } from '../config/axios';

/**
 * User Service
 * 
 * Handles user-related operations including profile management
 * and user data operations. Uses backend API for user operations.
 */

/**
 * Get the current user's profile
 * 
 * @returns Promise<User> The user's profile data
 */
const getProfile = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/api/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update the current user's profile
 * 
 * @param data - Partial user data to update
 * @returns Promise<User> The updated user profile
 */
const updateProfile = async (data: Partial<User>): Promise<User> => {
  try {
    const response = await api.put<User>('/api/user', data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * UserService - Main user service object
 */
export const UserService = {
  getProfile,
  updateProfile,
};
