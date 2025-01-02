# Rialgar's Advent of Code Leaderboard Visualizer
Not affiliated with "Advent of Code"

This tool allows you to show some more Details about a private Advent of Code Leaderboard in a Human Readable manner. Just paste the JSON result from the "API" for your Private Leaderboard and choose how to show the data.

It will remember the latest used json in local storage.

I also wanted to create a score variant that is independent of starting time, so it can be more interesting to compete internationally. I invented "time to second score" for this purpose. The scores are calculated for each day and summed. The members of the leaderboard are sorted by the time it took them to get the second star after getting the first. The quickest will get a score equal to the number of members on the board, decreasing by one for each placement. You get a score of 0 for the day if you did not finish part two.

[github page](https://rialgar.github.io/AdventOfCodeLeaderBoardViz)