import json
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import Group, User
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

ALLOWED_ROLES = {"ADMIN", "RESP_PROD", "SUPPLY_CHAIN_MANAGER", "OPERATEUR"}


def _normalize_role(role):
    role = (role or "").strip().upper()
    return role if role in ALLOWED_ROLES else "OPERATEUR"


def _user_payload(user):
    role = user.groups.first().name if user.groups.exists() else "OPERATEUR"
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "prenom": user.first_name,
        "nom": user.last_name,
        "role": role,
    }


@csrf_exempt
@require_POST
def register(request):
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Format JSON invalide"}, status=400)

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    prenom = (data.get("prenom") or "").strip()
    nom = (data.get("nom") or "").strip()
    role = _normalize_role(data.get("role"))

    if not email or not password:
        return JsonResponse({"error": "Email et mot de passe requis"}, status=400)

    username = (data.get("username") or email).strip()
    if not username:
        return JsonResponse({"error": "Nom d'utilisateur requis"}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Cet utilisateur existe deja"}, status=400)
    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Cet email est deja utilise"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=prenom,
        last_name=nom,
    )
    group, _ = Group.objects.get_or_create(name=role)
    user.groups.add(group)

    return JsonResponse(
        {"message": "Compte cree avec succes. Connectez-vous."},
        status=201,
    )


@csrf_exempt
@require_POST
def login_view(request):
    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Format JSON invalide"}, status=400)

    identifier = (data.get("email") or data.get("username") or data.get("identifier") or "").strip()
    password = data.get("password") or ""

    if not identifier or not password:
        return JsonResponse({"error": "Identifiant et mot de passe requis"}, status=400)

    user = None
    if "@" in identifier:
        user_obj = User.objects.filter(email__iexact=identifier).first()
        if user_obj:
            user = authenticate(request, username=user_obj.username, password=password)

    if user is None:
        user = authenticate(request, username=identifier, password=password)

    if user is None:
        return JsonResponse({"error": "Identifiants invalides"}, status=401)

    auth_login(request, user)
    return JsonResponse({"message": "Connexion reussie", "user": _user_payload(user)})


@csrf_exempt
@require_POST
def logout_view(request):
    auth_logout(request)
    return JsonResponse({"message": "Deconnexion reussie"})


@require_GET
def current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False}, status=401)
    return JsonResponse({"authenticated": True, "user": _user_payload(request.user)})


@require_GET
@ensure_csrf_cookie
def csrf_token(request):
    token = get_token(request)
    return JsonResponse({"csrfToken": token})
