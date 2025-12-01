# Testing Notification Preferences

## 🧪 Test Methods

### Method 1: Browser Test Page (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   ```
   http://localhost:3000/test-notifications
   ```

3. **Make sure you're logged in:**
   - If not logged in, log in first
   - The test page requires authentication

4. **Run the tests:**
   - Click "Test Database Connection" - Verifies database access
   - Click "Load Preferences" - Fetches current preferences
   - Click "Test Update" - Updates a preference and verifies
   - Click "Test Create" - Creates new preferences if needed

5. **Test the UI Component:**
   - Scroll down to see the Notification Preferences UI
   - Toggle switches to test preference updates
   - Verify changes are saved

### Method 2: API Testing with curl

If you have a valid session token, you can test the API directly:

```bash
# Get preferences (requires authentication)
curl -X GET http://localhost:3000/api/notifications/preferences \
  -H "Cookie: your-session-cookie"

# Update preferences
curl -X PUT http://localhost:3000/api/notifications/preferences \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "orderCreatedEmail": false,
    "orderCreatedSms": true
  }'
```

### Method 3: Direct Database Test

If you have database access:

```sql
-- Check if table exists
SELECT * FROM notification_preferences LIMIT 1;

-- Check preferences for a user
SELECT * FROM notification_preferences WHERE user_id = 'your-user-id';

-- Create test preferences
INSERT INTO notification_preferences (
  user_id,
  order_created_email,
  order_created_sms,
  order_created_push
) VALUES (
  'your-user-id',
  true,
  true,
  true
);
```

---

## ✅ What to Test

### 1. Database Connection
- ✅ Table exists
- ✅ Can query preferences
- ✅ Can create preferences
- ✅ Can update preferences

### 2. API Endpoints
- ✅ `GET /api/notifications/preferences` - Returns preferences
- ✅ `PUT /api/notifications/preferences` - Updates preferences
- ✅ `POST /api/notifications/preferences` - Creates preferences
- ✅ Error handling (401 for unauthorized, 400 for invalid data)

### 3. UI Component
- ✅ Component renders
- ✅ Shows current preferences
- ✅ Toggle switches work
- ✅ Changes save successfully
- ✅ Loading states work
- ✅ Error states display properly

### 4. Preference Structure
- ✅ All preference keys exist
- ✅ Default values are correct
- ✅ Preferences persist after update
- ✅ Preferences load correctly

---

## 🐛 Common Issues

### Issue: "Table does not exist"
**Solution:** Run the database migration:
1. Go to Supabase Dashboard
2. SQL Editor
3. Run: `supabase/migrations/004_notifications_schema.sql`

### Issue: "Unauthorized" error
**Solution:** Make sure you're logged in:
1. Go to login page
2. Log in with your credentials
3. Try the test again

### Issue: Preferences not saving
**Solution:** Check:
1. Database migration applied
2. User is authenticated
3. API endpoint is accessible
4. Check browser console for errors

### Issue: UI not loading
**Solution:** Check:
1. Component file exists: `components/notification-preferences.jsx`
2. No JavaScript errors in console
3. API endpoint is working
4. User is authenticated

---

## 📊 Expected Results

### Successful Test Results:

1. **Database Connection Test:**
   - ✅ Status: PASS
   - ✅ Message: "Successfully connected to database"

2. **Load Preferences Test:**
   - ✅ Status: PASS
   - ✅ Returns preferences object with all keys
   - ✅ Shows default values if no preferences exist

3. **Update Preferences Test:**
   - ✅ Status: PASS
   - ✅ Updates preference successfully
   - ✅ Reloads preferences to verify

4. **Create Preferences Test:**
   - ✅ Status: PASS
   - ✅ Creates preferences with provided values
   - ✅ Merges with defaults

### Preference Object Structure:

```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "orderCreatedEmail": true,
  "orderCreatedSms": true,
  "orderCreatedPush": true,
  "orderCreatedInApp": true,
  "orderStatusChangedEmail": true,
  "orderStatusChangedSms": false,
  "orderStatusChangedPush": true,
  "orderStatusChangedInApp": true,
  "orderReadyEmail": true,
  "orderReadySms": true,
  "orderReadyPush": true,
  "orderReadyInApp": true,
  "orderPreparingEmail": false,
  "orderPreparingSms": false,
  "orderPreparingPush": true,
  "orderPreparingInApp": true,
  "orderServedEmail": false,
  "orderServedSms": false,
  "orderServedPush": false,
  "orderServedInApp": true,
  "orderCompletedEmail": true,
  "orderCompletedSms": false,
  "orderCompletedPush": false,
  "orderCompletedInApp": true,
  "orderCancelledEmail": true,
  "orderCancelledSms": true,
  "orderCancelledPush": true,
  "orderCancelledInApp": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🎯 Next Steps After Testing

Once preferences are working:

1. **Test notification sending:**
   - Create a test order
   - Verify notifications are sent based on preferences

2. **Test all channels:**
   - Email notifications
   - SMS notifications
   - Push notifications
   - In-app notifications

3. **Test preference changes:**
   - Disable a channel
   - Create an order
   - Verify notification is not sent via disabled channel

4. **Test in production:**
   - Deploy to production
   - Test with real service providers
   - Monitor notification delivery

---

## 📝 Test Checklist

- [ ] Database migration applied
- [ ] User authenticated
- [ ] Test page accessible
- [ ] Database connection test passes
- [ ] Load preferences works
- [ ] Update preferences works
- [ ] Create preferences works
- [ ] UI component renders
- [ ] Toggle switches work
- [ ] Preferences persist
- [ ] Error handling works
- [ ] Loading states work

---

## 💡 Tips

1. **Use Browser DevTools:**
   - Check Network tab for API calls
   - Check Console for errors
   - Check Application tab for cookies/session

2. **Test Different Scenarios:**
   - New user (no preferences)
   - Existing user (has preferences)
   - Invalid data
   - Unauthorized access

3. **Verify Data:**
   - Check database directly
   - Check API responses
   - Check UI state

4. **Test Edge Cases:**
   - Missing user ID
   - Invalid preference keys
   - Network errors
   - Database errors

