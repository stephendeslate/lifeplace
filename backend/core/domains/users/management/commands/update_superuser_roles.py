# backend/core/domains/users/management/commands/update_superuser_roles.py
from core.domains.users.models import User
from django.core.management.base import BaseCommand
from django.db.models import Q


class Command(BaseCommand):
    help = 'Updates all superusers to have the ADMIN role'

    def handle(self, *args, **options):
        # Find all superusers without the ADMIN role
        superusers_to_update = User.objects.filter(
            Q(is_superuser=True) & ~Q(role='ADMIN')
        )
        
        count = superusers_to_update.count()
        
        if count > 0:
            # Update them to have the ADMIN role
            superusers_to_update.update(role='ADMIN')
            self.stdout.write(self.style.SUCCESS(f'Updated {count} superusers to have ADMIN role'))
        else:
            self.stdout.write(self.style.SUCCESS('No superusers needed updating'))