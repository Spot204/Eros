import { Card, CardContent } from "../components/card.jsx";
import { ScrollArea } from "../components/scroll-area.jsx";
import { UserCard } from "../components/user-card.jsx";

function calculatedMatchScore(user, prefs) {
    let score = 100;
    if (prefs.ageRange) {
        const [minAge, maxAge] = prefs.ageRange;
        if (user.age < minAge || user.age > maxAge) {
            score -= 20;
        }
    }

    if (prefs.interests && user.interests) {
        const common = user.interests.filter(i => prefs.interests.includes(i));
        const overlap = common.length / prefs.interests.length;
        score -= (1 - overlap)* 50;
    }
        return Math.max(0, Math.round(score));
}

function filtering(users, prefs) {
    return users.filter(user => {
        if (
            prefs.preferredGenders && !prefs.preferredGenders.includes(user.gender)
        ) return false;

        if (
            prefs.preferredOrientations && !prefs.preferredOrientations.includes(user.orientation)
        ) return false;

        return true;
    })
    .map(user => ({
        ...user,
        matchScore: calculatedMatchScore(user, prefs)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

const allUsers = [
  { id: "1", name: "Alice", age: 23, gender: "female", orientation: "straight", interests: ["music", "travel"] },
  { id: "2", name: "Bella", age: 25, gender: "female", orientation: "straight", interests: ["sports", "reading"] },
  { id: "3", name: "Chris", age: 24, gender: "male", orientation: "gay", interests: ["music", "movies"] },
];

const currentUserPrefs = {
    preferredGenders: ["female"],
    preferredOrientations: ["straight"],
    ageRange: [20, 26],
    interests: ["music", "travel", "sports"]
};

export function Matching() {
    const filteredMatches = filtering(allUsers, currentUserPrefs);

return (
    <Card className="h-[700px] flex flex-col border-2 border-indigo-200 shadow-xl">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className ="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="flex flex-col justify-start space-y-4 p-4 min-h-full">
                        {/* Matching content goes here */}
                                {filteredMatches.length === 0 ? (
                                    <p>No matches found based on your preferences.</p>
                                ) : (
                                    filteredMatches.map(user => (
                                        <UserCard
                                        key={user.id}
                                        user={user}
                                        score={user.matchScore}
                                        />
                                    ))
                                )}
                    </div>
                </ScrollArea>
            </div>
        </CardContent>
    </Card>
);
}