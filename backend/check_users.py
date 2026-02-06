import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
load_dotenv(env_path)

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Missing environment variables")
    exit(1)

supabase: Client = create_client(url, key)

print("Checking user_profiles table...\n")

# Get all profiles
response = supabase.table('user_profiles').select("*").order('created_at', desc=False).execute()

print("All user profiles:")
print("═" * 80)

for i, profile in enumerate(response.data, 1):
    print(f"\n{i}. User:")
    print(f"   ID: {profile.get('id')}")
    print(f"   Email: {profile.get('email')}")
    print(f"   Full Name: {profile.get('full_name') or '(not set)'}")
    print(f"   Role: {profile.get('role')}")
    print(f"   Created: {profile.get('created_at')}")

print("\n" + "═" * 80)

# Check students without full_name
students_without_name = [p for p in response.data if p.get('role') == 'student' and not p.get('full_name')]
if students_without_name:
    print(f"\n⚠️  Found {len(students_without_name)} student(s) without full_name:")
    for student in students_without_name:
        print(f"   - {student.get('email')} (ID: {student.get('id')})")
        
        # Try to get full_name from auth.users metadata
        auth_response = supabase.auth.admin.get_user_by_id(student.get('id'))
        if auth_response.user and auth_response.user.user_metadata:
            metadata_name = auth_response.user.user_metadata.get('full_name')
            if metadata_name:
                print(f"     Auth metadata has: {metadata_name}")
else:
    print("\n✓ All students have full_name set")

# Check admins without full_name
admins_without_name = [p for p in response.data if p.get('role') == 'admin' and not p.get('full_name')]
if admins_without_name:
    print(f"\n⚠️  Found {len(admins_without_name)} admin(s) without full_name:")
    for admin in admins_without_name:
        print(f"   - {admin.get('email')} (ID: {admin.get('id')})")
else:
    print("\n✓ All admins have full_name set")
