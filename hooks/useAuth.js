export const useAuth = () => {
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('userToken', userCredential.user.uid);
      await AsyncStorage.setItem('userData', JSON.stringify({
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        lastLoginAt: new Date().toISOString()
      }));
      return userCredential.user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const [token, currentUser] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        auth.currentUser
      ]);
      
      return !!token && !!currentUser;
    } catch (error) {
      return false;
    }
  };

  return { signIn, checkAuth };
}; 