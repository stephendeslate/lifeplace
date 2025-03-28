# backend/core/domains/clients/serializers.py
from core.domains.events.serializers import EventSerializer
from core.domains.users.serializers import UserSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class ClientProfileSerializer(serializers.Serializer):
    """Serializer for client profile data"""
    phone = serializers.CharField(allow_blank=True, required=False)
    company = serializers.CharField(allow_blank=True, required=False)


class ClientListSerializer(serializers.ModelSerializer):
    """Serializer for client list view"""
    profile = ClientProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'profile', 'date_joined', 'is_active'
        ]
        read_only_fields = ['id', 'date_joined', 'email']


class ClientDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for client data"""
    profile = ClientProfileSerializer(required=False)
    events = EventSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'profile', 'date_joined', 'is_active', 'events'
        ]
        read_only_fields = ['id', 'date_joined', 'email', 'events']


class ClientCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating clients"""
    profile = ClientProfileSerializer(required=False)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'profile', 'password', 'is_active'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        
        # Set role to CLIENT
        validated_data['role'] = 'CLIENT'
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Set password if provided
        if password:
            user.set_password(password)
            user.save()
        
        # Create or update profile
        if profile_data and hasattr(user, 'profile'):
            for key, value in profile_data.items():
                setattr(user.profile, key, value)
            user.profile.save()
        
        return user
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        
        # Update user fields
        for key, value in validated_data.items():
            setattr(instance, key, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        
        # Update profile if it exists
        if profile_data and hasattr(instance, 'profile'):
            for key, value in profile_data.items():
                setattr(instance.profile, key, value)
            instance.profile.save()
        
        return instance
    
class ClientInvitationSerializer(serializers.Serializer):
    """Serializer for sending a client invitation"""
    client_id = serializers.IntegerField()


class ClientInvitationDetailSerializer(serializers.Serializer):
    """Serializer for client invitation details"""
    id = serializers.UUIDField(format='hex_verbose')
    client = serializers.CharField(source='client.email')
    client_name = serializers.SerializerMethodField()
    invited_by = serializers.CharField(source='invited_by.email')
    is_accepted = serializers.BooleanField()
    expires_at = serializers.DateTimeField()
    created_at = serializers.DateTimeField()
    
    def get_client_name(self, obj):
        client = obj.client
        return f"{client.first_name} {client.last_name}".strip() or client.email


class AcceptClientInvitationSerializer(serializers.Serializer):
    """Serializer for accepting a client invitation"""
    password = serializers.CharField(min_length=8, write_only=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True)
    
    def validate(self, data):
        """Validate that passwords match"""
        if data.get('password') != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data