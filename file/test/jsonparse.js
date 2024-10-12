let myJson = {
    'strokeTechnique': {
        'forehand': [
            {
                'Dribble': [
                    {
                        'feedbackArea': 'ABCD',
                        'clips': [
                            {
                                'fileName': 'forehand_dribble_abcd1.mp4',
                                'tnFileName': 'forehand_dribble_abcd1.jpeg'
                            },
                            {
                                'fileName': 'forehand_dribble_abcd2.mp4',
                                'tnFileName': 'forehand_dribble_abcd2.jpeg'
                            }
                        ],
                        'observation': 'Observation text here',
                        'recommendation': 'Recommendation text here',
                        'correct_approach_video': {
                            'fileName': 'correct_forehand_dribble_abcd.mp4',
                            'tnFileName': 'correct_forehand_dribble_abcd.jpeg'
                        }
                    },
                    {
                        'feedbackArea': 'EFGH',
                        'clips': [
                            {
                                'fileName': 'forehand_dribble_efgh1.mp4',
                                'tnFileName': 'forehand_dribble_efgh1.jpeg'
                            },
                            {
                                'fileName': 'forehand_dribble_efgh2.mp4',
                                'tnFileName': 'forehand_dribble_efgh2.jpeg'
                            }
                        ],
                        'observation': 'Observation text here',
                        'recommendation': 'Recommendation text here',
                        'correct_approach_video': {
                            'fileName': 'correct_forehand_dribble_efgh.mp4',
                            'tnFileName': 'correct_forehand_dribble_efgh.jpeg'
                        }
                    }
                ]
            }
        ],
        'backhand': [
            {
                'Net tap': [
                    {
                        'feedbackArea': '1234',
                        'clips': [
                            {
                                'fileName': 'backhand_net-tap-1234.mp4',
                                'tnFileName': 'backhand_net-tap-1234.jpeg'
                            }
                        ],
                        'observation': 'Observation text here',
                        'recommendation': 'Recommendation text here',
                        'correct_approach_video': {
                            'fileName': 'correct_backhand_net-tap-1234.mp4',
                            'tnFileName': 'correct_backhand_net-tap-1234.jpeg'
                        }
                    }
                ]
            },
            {
                'Drop': [
                    {
                        'feedbackArea': 'XYZ',
                        'clips': [
                            {
                                'fileName': 'backhand_drop_xyz.mp4',
                                'tnFileName': 'backhand_drop_xyz.jpeg'
                            }
                        ],
                        'observation': 'Observation text here',
                        'recommendation': 'Recommendation text here',
                        'correct_approach_video': {
                            'fileName': 'backhand_drop_xyz.mp4',
                            'tnFileName': 'backhand_drop_xyz.jpeg'
                        }
                    }
                ]
            }
        ]
    },
    'footwork': {
        'attack': [
            {
                'Forehand Smash': [
                    {
                        'feedbackArea': 'ijkl',
                        'clips': [
                            {
                                'fileName': 'attack_forehand-smash_ijkl.mp4',
                                'tnFileName': 'attack_forehand-smash_ijkl.jpeg'
                            }
                        ],
                        'observation': 'Observation text here',
                        'recommendation': 'Recommendation text here',
                        'correct_approach_video': {
                            'fileName': 'correct_attack_forehand-smash_ijkl.mp4',
                            'tnFileName': 'correct_attack_forehand-smash_ijkl.jpeg'
                        }
                    }
                ]
            },
            {
                'Overhead Smash': [
                    {
                        'feedbackArea': 'mnop',
                        'clips': [
                            {
                                'fileName': 'attack_overhead-smash_mnop.mp4',
                                'tnFileName': 'attack_overhead-smash_mnop.jpeg'
                            }
                        ],
                        'observation': 'Observation text here',
                        'recommendation': 'Recommendation text here',
                        'correct_approach_video': {
                            'fileName': 'correct_attack_overhead-smash_mnop.mp4',
                            'tnFileName': 'correct_attack_overhead-smash_mnop.jpeg'
                        }
                    }
                ]
            }
        ],
        'defence': [
            {
                'Both corner defence': [
                    {
                        'feedbackArea': 'pqrs',
                        'clips': [
                            {
                                'fileName': 'defence_both-corner-defence_pqrs.mp4',
                                'tnFileName': 'defence_both-corner-defence_pqrs.jpeg'
                            }
                        ],
                        'observation': 'Observation text here',
                        'recommendation': 'Recommendation text here',
                        'correct_approach_video': {
                            'fileName': 'correct_defence_both-corner-defence_pqrs.mp4',
                            'tnFileName': 'correct_defence_both-corner-defence_pqrs.jpeg'
                        }
                    }
                ]
            }
        ]
    }
};

console.dir(Object.keys(myJson));

console.log('under ' + Object.keys(myJson)[0] + ' - ' );
console.dir(Object.keys(myJson.strokeTechnique));


console.log('under ' + Object.keys(myJson)[1] + ' - ');
console.dir(Object.keys(myJson.footwork));