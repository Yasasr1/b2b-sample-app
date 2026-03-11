type MeetingItem record {|
    string topic;
    string date;
    string startTime;
    string duration;
    string timeZone;
|};

public type Creator record {|
    string userId?;
    string emailAddress?;
    string actorUserId?;
|};

type Meeting record {|
    *MeetingItem;
    *Creator;
    readonly string id;
    readonly string org;
    readonly string createdAt;
|};
