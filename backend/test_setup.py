# test_setup.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studymatch.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import UserProfile, University
from matching.models import Subject, UserSubject


def create_test_data():
    """Создание тестовых данных"""
    try:
        # Создаем тестового пользователя
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'test@test.com', 'password': 'testpass123'}
        )
        if created:
            user.set_password('testpass123')
            user.save()
            print("✅ Тестовый пользователь создан")

        # Создаем профиль
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.faculty = "Факультет информатики"
        profile.year_of_study = 2
        profile.bio = "Тестовый пользователь для разработки"
        profile.save()
        print("✅ Профиль создан")

        # Создаем тестовые предметы
        subjects = [
            {'name': 'Математический анализ', 'code': 'MATH101'},
            {'name': 'Программирование', 'code': 'CS101'},
            {'name': 'Физика', 'code': 'PHYS101'},
        ]

        for subj_data in subjects:
            subject, created = Subject.objects.get_or_create(
                name=subj_data['name'],
                defaults={'code': subj_data['code']}
            )
            if created:
                print(f"✅ Предмет создан: {subject.name}")

            # Добавляем предмет пользователю
            UserSubject.objects.get_or_create(
                user=user,
                subject=subject,
                defaults={'level': 'intermediate'}
            )

        print("🎉 Тестовые данные успешно созданы!")

    except Exception as e:
        print(f"❌ Ошибка при создании тестовых данных: {e}")


if __name__ == "__main__":
    create_test_data()