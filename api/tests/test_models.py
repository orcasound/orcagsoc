from app.models import LabeledFile


def test_new_labeled_file():
    """
    GIVEN a LabeledFile model
    WHEN a new LabeledFile is created
    THEN check the filename, orca, extra_label, and expertise_level fields
    are defined correctly
    """
    new_labeled_file = LabeledFile('sound40.mp3', True, '', 'Beginner')
    assert new_labeled_file.filename == 'sound40.mp3'
    assert new_labeled_file.orca
    assert not new_labeled_file.extra_label
    assert new_labeled_file.expertise_level == 'Beginner'