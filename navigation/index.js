const Router = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="auth" component={AuthNavigator} />
      <Stack.Screen name="app" component={AppNavigator} />
      {/* autres routes */}
    </Stack.Navigator>
  );
}; 