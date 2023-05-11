function PackResponseModel(data) {
    this.id = data.packId;
    this.packId = data.packId;
    this.gameType = data.gameType;
    this.name = data.name;
    this.description = data.description;
    this.active = data.active;
    if (data.background) {
        this.background = {
            mediaType: data.background.mediaType,
            thumbnailUrl: data.thumbnailURL,
            coverUrl: data.coverURL,
            fullUrl: data.fullURL
        }
    }
    this.packType = data.packType;
    this.packOrder = data.packOrder;
    this.descending = data.descending;
    this.owner = data.owner;
    if (data.levels && Array.isArray(data.levels.items)) {
        const items = data.levels.items.map((level, idx) => {
            const gameObjects = {};
            let thumbnailUrl, coverUrl, fullUrl, nextLevelId = level.nextLevelId;
            if (level.gameObjects) {
                const questionAnswers = level.gameObjects.items.map(qna => {
                    const qnaRes = {};
                    qnaRes.question = JSON.parse(qna.items[0].valueString);
                    qnaRes.answer = JSON.parse(qna.items[1].valueString);
                    qnaRes.gameObjectId = qna.gameObjectId;
                    return qnaRes;
                })
                gameObjects.items = questionAnswers;
                gameObjects.count = level.gameObjects.count;
                gameObjects.hasMoreResults = level.gameObjects.hasMoreResults;
            }
            const { image = {}, icon = {} } = level;
            thumbnailUrl = image.thumbnailURL || icon.thumbnailURL;
            coverUrl = image.coverURL || icon.coverURL;
            fullUrl = image.fullURL || icon.fullURL;
            const nextLevel = data.levels.items[idx + 1];
            if (nextLevelId < 1 && nextLevel) {
                nextLevelId = nextLevel.gameLevelId
            }
            return ({
                id: level.gameLevelId,
                gameLevelId: level.gameLevelId,
                gameType: level.gameType,
                active: level.active,
                name: level.name,
                description: level.description,
                difficulty: level.difficulty,
                likesCount: level.likesCount,
                dislikesCount: level.dislikesCount,
                commentsCount: level.commentsCount,
                downloadCount: level.downloadCount,
                owner: level.owner,
                packId: this.packId,
                hasLiked: level.hasLiked,
                liked: level.liked !== undefined ? level.liked : level.hasLiked,
                nextLevelId,
                thumbnailUrl,
                coverUrl,
                fullUrl,
                gameObjects,
            })
        })
        this.levels = {
            items,
            count: data.levels.count,
            hasMoreResults: data.levels.hasMoreResults
        }
    }
}

module.exports = PackResponseModel;